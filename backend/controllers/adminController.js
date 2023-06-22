const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const { exec } = require("child_process");
const fs = require("fs");
const os = require("os");

const prisma = new PrismaClient();

// /admin/login
const adminLogin = async (req, res) => {
  try {
    const user = await prisma.Admin.findMany({
      where: {
        AND: [{ password: req.body.password }, { username: req.body.username }],
      },
    });

    if (user === null) {
      return res.status(400).send({ error: "no user found" });
    }

    console.log(user[0]);
    const token = jwt.sign(user[0], process.env.AUTH_TOKEN_ADMIN, {
      expiresIn: "2h",
    });
    res.send({ user_token: token });
  } catch (error) {
    res.status(400).send({ error: "Somthing went wrong, user couldn't be authenticated" });
  }
};

// /admin/order
const adminOrders = async (req, res) => {
  try {
    const orders = await prisma.Order.findMany({
      where: {
        shipped: false,
      },
      include: {
        users: {
          select: {
            username: true,
            seat_Number: true,
          },
        },
        orderDetail: {
          include: {
            products: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.send(orders);
  } catch (err) {
    res.send("someting went wrong");
  }
};

const allproducts = async (req, res) => {
  try {
    const info = await prisma.Products.findMany({});
    res.send({ info });
  } catch (err) {
    res.status(400).send({ error: err });
  }
};

// /admin/all
const adminOrdersAll = async (req, res) => {
  try {
    const orders = await prisma.Order.findMany({
      include: {
        users: {
          select: {
            username: true,
            seat_Number: true,
          },
        },
        orderDetail: {
          include: {
            products: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.send(orders);
  } catch (err) {
    res.send("someting went wrong");
  }
};

// /admin/delivered
const adminDelivered = async (req, res) => {
  try {
    const orders = await prisma.Order.update({
      where: {
        order_id: req.body.order,
      },
      data: {
        shipped: req.body.checker,
      },
    });
    res.send({ succes: "item is shipped" });
  } catch (err) {
    res.send("someting went wrong");
  }
};

const toggleWifi = (req, res) => {
  if (req.query.action === "true") {
    exec("cd ~/Desktop/backend/docs && dos2unix wifiStart.sh && chmod u+x wifiStart.sh && sh wifiStart.sh");
  } else {
    exec("cd ~/Desktop/backend/docs && dos2unix wifiStop.sh && chmod u+x wifiStop.sh && sh wifiStop.sh");
  }
  return "executed succesfully";
};

module.exports = { toggleWifi, adminLogin, adminOrders, adminDelivered, adminOrdersAll, allproducts };
