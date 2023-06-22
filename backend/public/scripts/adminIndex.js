const orderDiv = document.querySelector("#orders");
const orderCall = document.querySelector("#viewOrders");
const products = document.querySelector("#products");
let ALL_ORDERS;

getOrders();

setInterval(getOrders, 10000);

orderCall.onchange = getOrders;

async function getOrders() {
  getAllProducts();
  try {
    const orders = await fetch(`${window.location.origin}/admin/${orderCall.value}`);
    const orderInformations = await orders.json();

    if (JSON.stringify(ALL_ORDERS) !== JSON.stringify(orderInformations)) {
      ALL_ORDERS = orderInformations;
      orderDiv.innerHTML = " ";
      showOrders();
    }
  } catch (err) {
    window.alert("Er is iets fout gegaan");
  }
}

document.querySelector("#log_Out").onclick = getAndDeleteTokenCookie;

function getAndDeleteTokenCookie() {
  const cookies = document.cookie.split(";");

  let tokenCookie = null;
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith("token=")) {
      tokenCookie = cookie;
      break;
    }
  }

  if (tokenCookie) {
    const token = tokenCookie.split("=")[1];
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
    return token;
  }

  return null;
}

function showOrders() {
  ALL_ORDERS.forEach((el) => {
    const tr = document.createElement("tr");
    const seat = document.createElement("td");
    const product = document.createElement("td");
    const name = document.createElement("td");
    const price = document.createElement("td");
    const delivered = document.createElement("td");
    const orderTime = document.createElement("td");

    name.innerHTML = el.users.username;
    seat.innerHTML = el.users.seat_Number;
    orderTime.innerHTML = el.created_at.slice(11, 19);

    tr.appendChild(seat);
    tr.appendChild(product);
    tr.appendChild(price);
    tr.appendChild(name);
    tr.appendChild(orderTime);
    tr.appendChild(delivered);

    showProducts(el.orderDetail, product, price);

    deliver(el, delivered);

    orderDiv.appendChild(tr);
  });
}

function showProducts(products, prod, price) {
  let totalPrice = 0;

  products.forEach((product) => {
    totalPrice += parseInt(product.totalPrice);
    prod.innerHTML += `<p>Producten: ${product.products.product_name} - Aantal: ${product.total_quantity}`;
  });

  price.innerHTML = "$ " + totalPrice;
}

function deliver(order, td) {
  const checkbox = document.createElement("input");
  td.appendChild(checkbox);

  checkbox.type = "checkbox";
  checkbox.classList.add("checkbox");
  checkbox.checked = order.shipped;

  checkbox.onchange = async () => {
    try {
      const updateOrder = await fetch(`${window.location.origin}/admin/delivered`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: order.order_id, checker: checkbox.checked }),
      });
    } catch (err) {
      window.alert(err);
    }
  };
}

const wifitoggle = document.querySelector("#toggleWifi");

wifitoggle.onclick = async () => {
  try {
    await fetch(`${window.location.origin}/admin/toggle?action=${wifitoggle.checked}`);
  } catch (err) {
    window.alert(err);
  }
};

async function getAllProducts() {
  let prods;
  try {
    const orders = await fetch(`${window.location.origin}/admin/all_products`);
    prods = await orders.json();
  } catch (err) {
    window.alert("Er is iets fout gegaan");
  }
  products.innerHTML = "";
  await prods.info.forEach((e) => productshow(e));
}

function productshow(e) {
  const productDiv = document.createElement("div");
  productDiv.innerHTML = "";

  productDiv.innerHTML += `
    <div class="image"><img src="${window.location.origin + "/" + e.imageUrl}" /> </div>
    <div class="name"><span>${e.product_name}</span></div>
    <div class="amount"><span>Aantal: ${e.quantity}</span></div>
  `;

  products.appendChild(productDiv);
}

const flightInput = document.querySelector("#callsign");
const flightButton = document.querySelector("#startVlucht");

function startVlucht (el) {
  flightInput.disabled = true;
  flightButton.disabled = true;

  const callsign = flightInput.value.trim();

  fetch(`${window.location.origin}/vlucht/start${callsign == "" ? "" : "/" + callsign}`)
  .then(res => res.json())
  .then(data => {
    if(data.err) {
      alert(data.text);
      flightButton.disabled = false;
      flightInput.disabled = false;
      return;
    };
    const date1 = new Date(data.path.startTime * 1000);
    const date2 = new Date(data.path.endTime * 1000);
    alert(`Flight has been found!\nCallsign: ${data.data.callsign || data.data.flight_iata}\nFlight time: ${Intl.DateTimeFormat("nl-NL", {hour: "2-digit", minute: "2-digit"}).format(date2 - date1)}`);
  });
};

fetch(`${window.location.origin}/vlucht/informatie`).then(res => res.json())
.then(data => {
  console.log(data);
  flightInput.disabled = true;
  flightButton.disabled = true;
  flightInput.value = data.flight.callsign;
}).catch(err => {
  flightButton.disabled = false;
  flightInput.disabled = false;
});