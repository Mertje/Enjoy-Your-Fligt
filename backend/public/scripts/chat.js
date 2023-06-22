const socket = io();
const popupEL = document.querySelector("#popup");
const chatEL = document.querySelector("#chat");
const usersEL = document.querySelector("#contacts");

let connectedInfo;
const loggedUserName = (() => {
  const cookies = document.cookie
    .split("; ")
    .map((cookie) => cookie.split("="))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return cookies["username"];
})();

let timeoutID;
let typingUsers = {};

document.querySelector("#chatInput").addEventListener("keypress", () => {
  if(connectedInfo == undefined) return;
  socket.emit("typing", {groupID: connectedInfo.group_id, name: loggedUserName});
});

const typing = document.querySelector("#typing");
const typingText = document.querySelector("#typing h4");
socket.on("typing", (data) => {
  if(data.name == loggedUserName) return; // Alleen omdat broadcast ook naar zender stuurt.
  if(timeoutID != undefined) {
    clearTimeout(timeoutID);
  };
  typingUsers[data.name] = true;
  typing.classList.add("show");

  typingText.textContent = Object.keys(typingUsers).length > 1 ? "Meerdere personen zijn aan het typen" : `${data.name} is aan het typen`;

  timeoutID = setTimeout(() => {
    timeoutID = undefined;
    typing.classList.remove("show");
    typingText.textContent = "";
    typingUsers[data.name] = false;
  },3000);
})

initChat();
async function initChat() {
  try {
    const response = await fetch(`${window.location.origin}/chats/all`);
    const data = await response.json();
    usersEL.innerHTML = "";

    const createGroup = document.createElement("button");
    const toggle = document.querySelector("#toggle");
    createGroup.innerHTML = "Nieuwe groepschat";
    createGroup.onclick = newGroupChat;
    createGroup.classList.add("card", "new-chat");

    usersEL.appendChild(createGroup);

    toggle.onchange = function () {
      if (this.checked) {
        usersEL.style.display = "none";
      } else {
        usersEL.style.display = "block";
      }
    };

    data.groups.forEach((group, index) => {
      const button = document.createElement("button");
      const name = document.createElement("h3");

      button.onclick = () => {
        chatEL.setAttribute("data-chat-type", "group");
        for (let child of contacts.children) {
          child.classList.remove("activeChat");
        }
        button.classList.add("activeChat", "group");

        connectedInfo = { ...group, user_id: data.user_id };
        enterGroupChat(group);
      };
      name.innerText = group.group_name;
      button.classList.add("card");
      button.setAttribute("data-chat-type", "group");

      button.appendChild(name);
      usersEL.appendChild(button);
    });

    data.users.forEach((user, index) => {
      const button = document.createElement("button");
      const name = document.createElement("h3");
      const icon = document.createElement("img");

      name.classList.add("username");
      icon.classList.add("profileimg");

      button.onclick = () => {
        if (user.blocked) {
          unblockUser(user, button);
          return;
        }

        chatEL.setAttribute("data-chat-type", "chat");

        for (let child of contacts.children) {
          child.classList.remove("activeChat");
        }
        button.classList.add("activeChat");
        connectedInfo = user;
        enterChat();
      };
      name.innerText = user.username;
      icon.src = `../assets/chat/random${index}.jpg`;
      icon.alt = "User icon";

      button.classList.add("card");
      button.setAttribute("data-chat-type", "private");

      if (user.blocked) button.classList.add("blocked", "blocked-icon");

      button.appendChild(icon);
      button.appendChild(name);
      usersEL.appendChild(button);
    });
  } catch (error) {
    console.error(error);
  }
}

async function enterGroupChat(data) {
  chatEL.querySelector("header").innerHTML = "";
  const chat = chatEL.querySelector(".messages");
  chat.textContent = "";
  await getChat(data["group_id"]);

  const message = chatEL.querySelector("#chatInput");
  const sendButton = chatEL.querySelector("#chatSend");
  socket.emit("join", data.group_id);
  sendButton.onclick = () => sendChat(message, data["group_id"], true);
}

async function newGroupChat() {
  const popupHeader = popupEL.querySelector("header");
  const popupContent = popupEL.querySelector(".content");
  const popupFooter = popupEL.querySelector("footer");
  const MAX_GROUPNAME_LENGTH = 32;

  const title = document.createElement("h2");
  popupHeader.appendChild(title);
  title.textContent = "Nieuwe groepschat.";

  const groupName = document.createElement("div");
  groupName.id = "groupName";
  const groupNameInput = document.createElement("input");
  const groupNameLabel = document.createElement("label");
  groupNameLabel.textContent = "Type in the group name: ";
  groupNameLabel.htmlFor = "newGroupName";
  groupNameInput.id = "newGroupName";
  groupNameInput.name = "newGroupName";
  groupNameInput.type = "text";
  groupNameInput.maxLength = MAX_GROUPNAME_LENGTH;
  groupNameInput.placeholder = "Nieuwe groepschat.";

  groupName.appendChild(groupNameLabel);
  groupName.appendChild(groupNameInput);
  popupContent.appendChild(groupName);

  const users = await fetchAllUsers();
  const table = createUsersList(users);
  const createButton = document.createElement("button");
  createButton.innerText = "Groepschat maken.";
  createButton.classList.add("actionButton");
  createButton.disabled = true;
  createButton.onclick = () => {
    const selectedUserIds = getSelectedUserIds(table);
    createGroupChatRequest(selectedUserIds, groupNameInput.value || "Nieuwe groepschat");
  };

  popupContent.appendChild(table);
  popupFooter.appendChild(createButton);
  popupEL.showModal();
}

function unblockUser(user, button) {
  const popupFooter = popupEL.querySelector("footer");
  const blocked = user.blockData;
  const title = document.createElement("h3");
  title.textContent = `Deblokkeer ${user.username} om door te gaan met chatten.`;
  popupEL.querySelector("header").appendChild(title);

  const unblockButton = document.createElement("button");
  unblockButton.innerHTML = "Deblokkeer";
  unblockButton.classList.add("actionButton");
  unblockButton.onclick = async () => {
    await fetch(`${window.location.origin}/chats/unblockUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: blocked }),
    });
    initChat();
    closePopup();
  };

  popupFooter.appendChild(unblockButton);
  popupEL.showModal();
}

function closePopup() {
  popupEL.childNodes.forEach((el) => (el.innerHTML = ""));

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "Sluit";
  closeButton.onclick = () => closePopup();
  closeButton.classList.add("cancelButton");
  popupEL.querySelector("footer").appendChild(closeButton);
  popupEL.close();
}

async function enterChat() {
  const chat = chatEL.querySelector(".messages");
  try {
    const response = await fetch(`${window.location.origin}/chats/createSingle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIds: [connectedInfo["user_id"]],
      }),
    });
    const data = await response.json();
    chat.textContent = "";

    connectedInfo.group_id = data.group.group_id;

    await getChat(data.group["group_id"]);

    if (data.blocked && data.blocked.me) {
      return (chat.innerHTML += `<h1 class='block-message'> Je bent geblokkeerd </h1>`);
    }

    await updateChatHeader(data.group["group_id"]);

    const message = chatEL.querySelector("#chatInput");
    const sendButton = chatEL.querySelector("#chatSend");

    socket.emit("join", data.group.group_id);
    sendButton.onclick = () => sendChat(message, data.group.group_id);
  } catch (error) {
    console.error(error);
  }
}

async function getChat(id) {
  const chat = chatEL.querySelector(".messages");
  try {
    const response = await fetch(`${window.location.origin}/chats/group/${id}`);
    const data = await response.json();
    if (chatEL.getAttribute("data-chat-type") == "group") {
      const header = chatEL.querySelector("header");
      const h2 = document.createElement("h2");
      h2.textContent = data.group_name;
      h2.onclick = () => popupHandleGroupInfo(data);
      header.appendChild(h2, data);
    }

    data["messages"].forEach((element) => {
      createMessage(data["user"] === element.userID, element);
    });
    chat.scrollTo({ top: chat.scrollHeight - chat.clientHeight });
  } catch (error) {
    console.error(error);
  }
}

function popupHandleGroupInfo(data) {
  popupEL.showModal();
  const popupHeader = popupEL.querySelector("header");
  const popupHeaderText = document.createElement("h2");
  popupHeader.appendChild(popupHeaderText);
  popupHeaderText.textContent = data.group_name;

  const changeNameDiv = document.createElement("div");
  changeNameDiv.classList.add("changeNameDiv");

  const changeNameButton = document.createElement("button");
  changeNameButton.classList.add("actionButton");
  changeNameButton.innerText = "Sla op";

  const inputNieuwNaam = document.createElement("input");

  inputNieuwNaam.placeholder = "Nieuw groepsnaam";
  inputNieuwNaam.type = "text";

  changeNameDiv.appendChild(inputNieuwNaam);
  changeNameDiv.appendChild(changeNameButton);

  changeNameButton.onclick = () => changeGroupName(inputNieuwNaam.value, data.group_id);

  const popupContent = popupEL.querySelector(".content");
  const userText = document.createElement("h3");
  userText.textContent = "Gebruikers in de groep:";
  popupContent.appendChild(changeNameDiv);
  popupContent.appendChild(userText);
  const userList = document.createElement("ul");
  popupContent.appendChild(userList);

  data["UserGroup"].forEach((element) => {
    const nameHolder = document.createElement("li");
    nameHolder.innerText = element["users"]["username"];
    userList.appendChild(nameHolder);
  });

  const popupFooter = popupEL.querySelector("footer");
  const addUser = document.createElement("button");
  addUser.textContent = "Voeg toe";
  const leaveButton = document.createElement("button");

  popupFooter.appendChild(addUser);
  popupFooter.appendChild(leaveButton);
  addUser.classList.add("menuButton");
  leaveButton.classList.add("actionButton");
  leaveButton.textContent = "Verlaat groep";
  addUser.onclick = () => addUserContent(popupContent, data, addUser);
  leaveButton.onclick = () => {
    sendChat({value: `SYSTEEM: ${loggedUserName} Heeft de chat verlaten`}, data.group_id, true)
    .then(() => {
      leaveChat(data.group_id);
      popupEL.close();
    });
  };
}

async function changeGroupName(value, groupId) {
  if (value.length === 0) {
    return alert("Voer meer dan 1 karakter in");
  }
  try {
    const fetchData = await fetch(`${window.location.origin}/chats/updateGroup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: groupId, newName: value }),
    });
    finalData = await fetchData.json();

    alert("Met succes veranderd, pagina wordt opnieuw ingeladen");
    setTimeout(() => location.reload(), 1000);
  } catch (e) {}
}

async function addUserContent(content, data, addUser) {
  content.innerHTML = "";
  addUser.innerText = "Voeg de geselecteerde toe";
  let finalData;
  popupEL.querySelector("footer").lastElementChild.remove();

  try {
    const fetchData = await fetch(`${window.location.origin}/chats/getSomeUsers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupID: data.group_id }),
    });
    finalData = await fetchData.json();
  } catch (e) {}

  finalData.forEach((dat) => {
    const divBox = document.createElement("div");
    divBox.classList.add("specialInput");
    const lab = document.createElement("label");
    lab.innerText = dat.username;
    const box = document.createElement("input");
    box.type = "checkbox";
    box.value = dat.user_id;

    divBox.appendChild(box);
    divBox.appendChild(lab);

    content.appendChild(divBox);
  });

  addUser.onclick = async () => {
    const checkboxes = document.querySelectorAll('.specialInput input[type="checkbox"]:checked');
    const selectedValues = Array.from(checkboxes).map((checkbox) => checkbox.value);
    content.innerHTML = "Persoon is toegevoegd";

    try {
      await fetch(`${window.location.origin}/chats/addUsersGroup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: selectedValues,
          groupId: data.group_id,
        }),
      });
    } catch (e) {
      alert("Iets ging verkeerd probeer het later opnieuw");
    }

    setTimeout(() => closePopup(), 1000);
  };
}

async function leaveChat(id) {
  const messageContainer = chatEL.querySelector(".messages");
  try {
    await fetch(`${window.location.origin}/chats/leaveGroup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: id,
      }),
    });
    initChat();
    chat.querySelector("header").innerHTML = "";
    messageContainer.textContent = "";
    socket.emit("leave", { group_id: id });
    connectedInfo = undefined;
  } catch (error) {
    console.error(error);
  }
}

async function sendChat(value, groupID, isPubGroup) {
  try {
    if (value.value == "") throw "Geen berichtinhoud";
    const response = await fetch(`${window.location.origin}/chats/newMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupID: groupID,
        content: value.value,
      }),
    });
    const data = await response.json();

    messageSocket(data, isPubGroup);
    value.value = "";
  } catch (error) {
    console.error(error);
  }
}

function messageSocket(data, isPubGroup = false) {
  socket.emit("message", { ...data, group: isPubGroup, sender: loggedUserName });
}

socket.on("message", (message) => {
  if (message.group) {
    createMessage(connectedInfo["user_id"] === message.data.userID, message.data, message.sender);
  } else {
    createMessage(connectedInfo["user_id"] !== message.data.userID, message.data, message.sender);
  }
});

function createMessage(isMyself, element, sender) {
  const chat = chatEL.querySelector(".messages");
  const messageContainer = document.createElement("div");
  const message = document.createElement("div");
  const messageContent = document.createElement("p");
  messageContainer.appendChild(message);
  message.appendChild(messageContent);

  messageContainer.classList.add("messageContainer");
  message.classList.add("message");

  messageContent.innerText = element.content;

  if (isMyself) {
    messageContainer.classList.add("messageSelf");
  }
  if (document.querySelector(".activeChat").getAttribute("data-chat-type") == "group") {
    const userName = document.createElement("span");
    messageContainer.appendChild(userName);
    userName.innerText = sender || element.user.username;
  }

  chat.appendChild(messageContainer);

  if (chat.scrollTop + messageContainer.clientHeight > chat.scrollHeight - chat.clientHeight - messageContainer.clientHeight) {
    messageContainer.scrollIntoView({ behavior: "smooth" });
  }
}

async function updateChatHeader(id) {
  const header = chatEL.querySelector("header");
  const blockButton = document.createElement("button");
  const activeChat = usersEL.querySelector(".activeChat");
  const user = document.createElement("h3");
  const img = document.createElement("img");
  user.classList.add("username");
  img.classList.add("profileimg");
  header.innerHTML = "";

  user.textContent = activeChat.querySelector("h3").textContent;
  img.src = activeChat.querySelector("img").src;

  blockButton.classList.add("blocked-icon", "block-user");

  blockButton.onclick = async () => {
    try {
      await fetch(`${window.location.origin}/chats/blockUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupID: id }),
      });

      leaveChat();
    } catch (error) {
      console.error(error);
    }
  };
  header.appendChild(img);
  header.appendChild(user);
  header.appendChild(blockButton);
}

async function fetchAllUsers() {
  try {
    const response = await fetch(`${window.location.origin}/chats/all`);
    const data = await response.json();
    return data.users;
  } catch (error) {
    console.error(error);
  }
}

function createUsersList(users) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");

  const usersHeader = document.createElement("th");
  usersHeader.textContent = "Selecteer gebruikers om toe te voegen";

  headerRow.appendChild(usersHeader);
  thead.appendChild(headerRow);
  table.appendChild(thead);
  table.appendChild(tbody);

  users.forEach((user, index) => {
    const row = document.createElement("tr");

    const userCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.id = `user-${index}`;
    checkbox.name = `user-${index}`;
    checkbox.type = "checkbox";
    checkbox.dataset.userId = user.user_id;

    const label = document.createElement("label");
    label.htmlFor = `user-${index}`;

    label.appendChild(checkbox);
    label.innerHTML += user.username;

    userCell.appendChild(label);
    row.appendChild(userCell);
    tbody.appendChild(row);
  });

  table.querySelectorAll("input").forEach((el) => {
    el.onclick = () => {
      const selectedUserIds = getSelectedUserIds(table);
      if (selectedUserIds.length >= 2) {
        popupEL.querySelector(".actionButton").disabled = false;
      } else {
        popupEL.querySelector(".actionButton").disabled = true;
      }
    };
  });

  return table;
}

function getSelectedUserIds(el) {
  const checkboxes = el.querySelectorAll("input[type='checkbox']");
  const selectedUserIds = [];
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedUserIds.push(checkbox.dataset.userId);
    }
  });
  return selectedUserIds;
}

async function createGroupChatRequest(userIds, name) {
  try {
    const response = await fetch(`${window.location.origin}/chats/createSingle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds, name }),
    });
    const data = await response.json();
    initChat();
    closePopup();
  } catch (error) {
    console.error(error);
  }
}
