const content = document.querySelector("#content");
const cart = document.querySelector("#cartAmount");
const category = document.querySelector("#category");

const SHOP_PRODUCTS = [];
let TOTAL_ITEMS = 0;

cart.textContent = TOTAL_ITEMS;

async function getData(categoryName) {
  content.innerHTML = "";
  try {
    const data = await fetch(`${window.location.origin}/webshop/${categoryName ? categoryName : "avaibleProducts"}`);
    const main = await data.json();

    main.info.forEach((el) => {
      const button = document.createElement("button");
      button.innerHTML = "+ Wagen";
      button.onclick = () => addToCart(el, SHOP_PRODUCTS);

      const productDiv = document.createElement("div");
      productDiv.classList.add("products");

      const productImg = document.createElement("img");
      const productData = document.createElement("div");

      productImg.src = el.imageUrl;
      productImg.alt = "Product image";
      productData.innerHTML += `<h2 class="title">${el.product_name}</h2> <p class="stock">Voorraad over: <span>${
        el.quantity
      }</span></p> <p class="price">Prijs: <span>${Intl.NumberFormat("nl-NL", { currency: "EUR", style: "currency" }).format(el.price)}</span></p>`;

      productData.appendChild(button);
      productDiv.appendChild(productImg);
      productDiv.appendChild(productData);
      content.appendChild(productDiv);
    });
  } catch (error) {
    window.alert("Er gebeurde iets vreemds: " + error);
  }
}

function addToCart(product, store) {
  const productToUpdate = store.find((p) => p.product_id === product.product_id);

  if (productToUpdate && productToUpdate.amount >= 5) {
    return window.alert("U kunt niet meer dan 5 stuks van hetzelfde artikel in één keer bestellen");
  }

  TOTAL_ITEMS++;
  if (productToUpdate) {
    productToUpdate.amount += 1;
  } else {
    store.push({
      product_id: product.product_id,
      name: product.product_name,
      amount: 1,
      img: product.imageUrl,
      price: product.price,
    });
  }
  cart.textContent = TOTAL_ITEMS;
}

function orderProducts() {
  fetch(`${window.location.origin}webshop/new_order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIDConnect: "hi" }),
  }).then((data) => data.json());
}

function showPopup() {
  if (TOTAL_ITEMS === 0) {
    emptyBox();
    return;
  }

  const popupBox = document.getElementById("popup");
  popupBox.innerHTML = "";
  const table = document.createElement("table");
  const tbody = document.createElement("tbody");
  table.id = "js-table-order";

  table.innerHTML += `
    <thead>
      <tr>
        <th></th>
        <th>Producten</th>
        <th>Prijs</th>
        <th>Aantal</th>
        <th>Totaal</th>
      </tr>
    </thead>`;
  table.appendChild(tbody);

  SHOP_PRODUCTS.forEach(function (product) {
    const tableRow = document.createElement("tr");

    const imgTD = document.createElement("td");
    const productNameTD = document.createElement("td");
    const priceTD = document.createElement("td");
    const amountTD = document.createElement("td");
    const totalTD = document.createElement("td");
    const minusSpam = document.createElement("span");
    const plusSpam = document.createElement("span");
    const amountSpan = document.createElement("span");

    const img = document.createElement("img");
    img.src = product.img;

    minusSpam.onclick = () => updateCart("remove", product);
    plusSpam.onclick = () => updateCart("add", product);

    minusSpam.textContent = "-";
    amountSpan.textContent = product.amount;
    minusSpam.classList.add("spammer");
    minusSpam.classList.add("minus");

    plusSpam.textContent = "+";
    plusSpam.classList.add("spammer");

    amountTD.classList.add("amount_cart");
    imgTD.appendChild(img);

    productNameTD.textContent = product.name;
    priceTD.textContent = Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(product.price);
    totalTD.textContent = Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(product.amount * product.price);

    amountTD.appendChild(minusSpam);
    amountTD.appendChild(amountSpan);
    amountTD.appendChild(plusSpam);
    tableRow.appendChild(imgTD);
    tableRow.appendChild(productNameTD);
    tableRow.appendChild(priceTD);
    tableRow.appendChild(amountTD);
    tableRow.appendChild(totalTD);
    tbody.appendChild(tableRow);
  });
  popupBox.appendChild(table);

  const totalPriceDiv = document.createElement("div");
  totalPriceDiv.className = "totalPrice";

  const totalPriceH3 = document.createElement("h3");
  totalPriceH3.textContent = `Totaal: ${totalCost()}`;
  totalPriceDiv.appendChild(totalPriceH3);

  popupBox.appendChild(totalPriceDiv);

  const footerDiv = document.createElement("div");
  footerDiv.classList.add("popupFooter");

  const orderButton = document.createElement("button");
  orderButton.innerHTML = "Bestel";
  orderButton.onclick = placeOrder;
  orderButton.classList.add("placeOrder");

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "Sluit";
  closeButton.onclick = closePopup;
  closeButton.classList.add("cancelButton");

  footerDiv.appendChild(orderButton);
  footerDiv.appendChild(closeButton);

  popupBox.appendChild(footerDiv);
  if (!popupBox.getAttributeNames().includes("open")) {
    popupBox.showModal();
  }
}

function updateCart(action, product) {
  let foundProduct = SHOP_PRODUCTS.find((p) => p.product_id === product.product_id);

  if (foundProduct.amount === 5 && action === "add") {
    return window.alert("U kunt niet meer dan 5 dezelfde artikelen in uw winkelwagen plaatsen");
  }

  if (action === "add") {
    foundProduct.amount += 1;
    TOTAL_ITEMS++;
  }
  if (action === "remove") {
    foundProduct.amount -= 1;
    TOTAL_ITEMS--;
  }

  cart.textContent = TOTAL_ITEMS;

  if (foundProduct.amount === 0) {
    SHOP_PRODUCTS.splice(SHOP_PRODUCTS.indexOf(product), 1);
  }
  if (SHOP_PRODUCTS.length === 0) {
    cart.textContent = 0;
    return emptyBox();
  }

  showPopup();
}

function closePopup() {
  const popup = document.getElementById("popup");
  popup.innerHTML = "";
  popup.close();
}

function totalCost() {
  const total = SHOP_PRODUCTS.reduce((total, product) => {
    return total + product.price * product.amount;
  }, 0);
  return Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(total);
}

async function placeOrder() {
  try {
    const response = await fetch(`${window.location.origin}/webshop/new_order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ordered: SHOP_PRODUCTS }),
    });
    const responseJson = await response.json();

    if (responseJson.error) {
      document.querySelector("#popup").innerHTML += `<p>${responseJson.error}</p>`;
    } else {
      confirm(responseJson);
    }
  } catch (error) {
    window.alert("Op dit moment is bestellen niet mogelijk");
  }
}

function confirm() {
  TOTAL_ITEMS = 0;
  SHOP_PRODUCTS.length = 0;
  cart.textContent = 0;
  const popupBox = document.querySelector("#popup");
  popupBox.innerHTML = "";
  popupBox.innerHTML += `
    <div class="succes_order">
      <h2>Bestelling geplaatst!</h2>
      <p>De stewardess komt zo.</p>
    </div>
    <button class="cancelButton" onclick="closePopup()">Dichtbij </button>
    `;
  getData();
}

async function getOrderHistory() {
  const popupBox = document.getElementById("popup");
  popupBox.innerHTML = `<div id="order"> </div>`;
  if (!popupBox.getAttributeNames().includes("open")) {
    popupBox.showModal();
  }

  const table = document.createElement("table");
  table.id = "js-table-history";
  let data;

  try {
    const dataJson = await fetch(`${window.location.origin}/webshop/orderHistory`);
    data = await dataJson.json();
  } catch (err) {
    console.log(err);
  }

  if (data.length > 0) {
    table.innerHTML += `
    <thead>
      <tr>
        <th>Tijd</th>
        <th>Verzonden</th>
        <th>Detail</th>
        <th>Annuleren</th>
      </tr>
    </thead>
    `;

    const tableBody = document.createElement("tbody");
    table.appendChild(tableBody);

    data.forEach((element) => {
      const tdCancel = document.createElement("td");

      const date = new Date(element["created_at"]);
      const button = document.createElement("button");
      button.classList.add("orders");
      button.onclick = () => openOrder(tr, element);

      const buttonCancel = document.createElement("button");
      buttonCancel.onclick = () => cancelOrder(element);
      tdCancel.appendChild(buttonCancel);
      buttonCancel.innerHTML = "Annuleer";
      buttonCancel.classList.add("cancelButton");
      if (element.shipped) {
        buttonCancel.disabled = true;
      }

      const tr = document.createElement("tr");
      const td = document.createElement("td");
      const time = document.createElement("td");
      const shipped = document.createElement("td");

      shipped.textContent = `${element.shipped ? "Onderweg" : "Voorbereiden."}`;
      time.textContent = Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
      button.textContent = "Bestelling";

      td.appendChild(button);

      tr.appendChild(time);
      tr.appendChild(shipped);

      tr.appendChild(td);
      tr.appendChild(tdCancel);
      tableBody.appendChild(tr);
    });
  } else {
    table.innerHTML += `<h2>U heeft nog geen bestelling geplaatst    </h2>`;
  }

  popupBox.appendChild(table);

  const exitButton = document.createElement("button");
  exitButton.onclick = () => closePopup();
  exitButton.textContent = "Sluit";
  exitButton.classList.add("cancelButton");
  popupBox.appendChild(exitButton);
}

function openOrder(tableRow, element) {
  const all = document.querySelectorAll(".selected");
  all.forEach((e) => e.classList.remove("selected"));
  const showHere = document.querySelector("#order");
  let total = 0;

  const tab = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  tab.appendChild(thead);
  tab.appendChild(tbody);
  tableRow.classList.add("selected");

  showHere.innerHTML = "";
  showHere.appendChild(tab);

  const baseTR = document.createElement("tr");

  const productTH = document.createElement("th");
  productTH.innerHTML = "Product";
  const priceTH = document.createElement("th");
  priceTH.innerHTML = "Prijs";
  const amountTH = document.createElement("th");
  amountTH.innerHTML = "Aantal";

  baseTR.appendChild(productTH);
  baseTR.appendChild(priceTH);
  baseTR.appendChild(amountTH);

  thead.appendChild(baseTR);

  element["orderDetail"].forEach((ele) => {
    const mainTR = document.createElement("tr");
    showHere.appendChild(mainTR);

    const tdName = document.createElement("td");
    tdName.innerHTML = ele.productName;
    mainTR.appendChild(tdName);

    const tdTot = document.createElement("td");
    tdTot.innerHTML = ele.totalPrice;
    mainTR.appendChild(tdTot);

    const tdQuan = document.createElement("td");
    tdQuan.innerHTML = ele.total_quantity;
    mainTR.appendChild(tdQuan);
    tbody.appendChild(mainTR);
    total += ele.total_quantity * ele.totalPrice;
  });

  const totalTR = document.createElement("tr");
  const totalTD = document.createElement("td");
  totalTD.setAttribute("colspan", 3);
  totalTD.classList.add("total-price");
  totalTD.textContent = `Total price is: ${Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(total)}`;
  totalTR.appendChild(totalTD);
  tbody.appendChild(totalTR);
}

async function cancelOrder(clicked) {
  const dat = await fetch(`${window.location.origin}/webshop/deleteOrder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ordered: clicked }),
  });
  const data = await dat.json();
  if (data.error) {
    window.alert("De bestelling is al afgerond");
  }
  getOrderHistory();
  getData();
}

function emptyBox() {
  const popupBox = document.querySelector("#popup");
  popupBox.innerHTML = `<h2>Er zijn nog geen producten in de winkelwagen</h2>`;

  const exitButton = document.createElement("button");
  exitButton.onclick = () => closePopup();
  exitButton.textContent = "Sluit";
  exitButton.classList.add("cancelButton");
  popupBox.appendChild(exitButton);
  if (!popupBox.getAttributeNames().includes("open")) {
    popupBox.showModal();
  }
}

categories();
async function categories() {
  try {
    const data = await fetch(`${window.location.origin}/webshop/categories`);
    let dataJson = await data.json();

    let button = document.createElement("button");
    button.onclick = (el) => {
      document.querySelector("#category button.selected")?.classList.remove("selected");
      el.target.classList.add("selected");
      getData();
    };
    button.innerHTML = `Alle`;
    category.appendChild(button);

    dataJson.forEach((element) => {
      const button = document.createElement("button");
      button.onclick = (el) => {
        document.querySelector("#category button.selected")?.classList.remove("selected");
        el.target.classList.add("selected");
        getData(element.category_name);
      };
      button.innerHTML = `${element.category_name}`;
      category.appendChild(button);
    });

    button.click();
  } catch (err) {
    window.alert("Iets ging verkeerd");
  }
}
