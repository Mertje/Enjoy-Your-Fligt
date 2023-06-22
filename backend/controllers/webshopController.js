const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// send all product to the website
const avaibleProducts = async (req, res) => {
  try {
    const info = await prisma.Products.findMany({
      where: {
        quantity: {
          gt: 0,
        },
      },
    });
    res.send({ info });
  } catch (err) {
    res.status(400).send({ error: err });
  }
};

// for Sys admin meant
const insertProducts = async (req, res) => {
  const { name, price, quantity, isbn } = req.body;
  if (!(name || price || quantity || isbn)) {
    res.status(400).send({ error: "something is missing" });
  }

  try {
    await prisma.Products.create({
      data: {
        product_name: name,
        price: price,
        quantity: quantity,
        isbn: isbn,
      },
    });
    res.send({ message: "Succes" });
  } catch (err) {
    res.status(400).send({ error: "The ticket number is not working" });
  }
};

const createOrder = async (req, res) => {
  const { ordered } = req.body;
  const { user_id } = req.user;
  let order;

  if (ordered === undefined || user_id === undefined) {
    res.send({ error: "some variables missing" });
    return;
  }
  // check for stock
  const outOfStockPromise = ordered.map(async (product) => {
    const productDB = await prisma.Products.findUnique({
      where: {
        product_id: product.product_id,
      },
    });
    if (productDB.quantity < product.amount) {
      return productDB;
    }
  });

  const outOfStock = await Promise.all(outOfStockPromise);
  if (outOfStock[0] !== undefined) {
    return res.send({
      error: `Product: ${outOfStock[0].product_name} is low on stock. refresh to see current stock`,
    });
  }

  try {
    order = await prisma.Order.create({
      data: {
        userID: user_id,
      },
    });

    ordered.forEach(async (product) => {
      await prisma.Order_details.create({
        data: {
          orderID: order.order_id,
          productName: product.name,
          productID: product.product_id,
          total_quantity: product.amount,
          totalPrice: product.amount * product.price,
        },
      });

      await prisma.Products.update({
        where: {
          product_id: product.product_id,
        },
        data: {
          quantity: {
            decrement: product.amount,
          },
        },
      });
    });
  } catch (err) {
    console.log(err);
  }
  res.send({ order: order, orderedItems: ordered });
};

const orderHistory = async (req, res) => {
  const { user_id } = req.user;

  const data = await prisma.Order.findMany({
    where: {
      userID: user_id,
    },
    include: {
      orderDetail: true,
    },
    orderBy: [
      {
        created_at: "desc",
      },
    ],
  });

  res.send(data);
};

const deleteOrder = async (req, res) => {
  const { user_id } = req.user;
  const { ordered } = req.body;

  try {
    const orderData = await prisma.Order.findUnique({
      where: {
        order_id: ordered.order_id,
      },
    });
    if (orderData.shipped) {
      return res.send({ error: "Already send" });
    }
  } catch (err) {
    console.log(err);
    return res.send({ error: "error" });
  }

  try {
    await prisma.Order_details.deleteMany({
      where: {
        orderID: ordered.order_id,
      },
    });
    await prisma.Order.delete({
      where: {
        order_id: ordered.order_id,
      },
    });
  } catch (error) {
    return res.send({ succes: false });
  }

  ordered.orderDetail.forEach(async (element) => {
    try {
      await prisma.Products.update({
        where: {
          product_id: element.productID,
        },
        data: {
          quantity: {
            increment: element.total_quantity,
          },
        },
      });
    } catch (error) {
      return res.send({ succes: false });
    }
  });

  res.send({ succes: true });
};

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.Category.findMany({});
    res.send(categories);
  } catch (err) {
    res.send({ error: "something went wrong" });
  }
};

const getCategoryProducts = async (req, res) => {
  try {
    const categoryProd = await prisma.Products.findMany({
      where: {
        categories: {
          some: {
            category: {
              category_name: req.params.cat,
            },
          },
        },
        quantity: {
          gt: 0,
        },
      },
    });
    res.send({ info: categoryProd });
  } catch (err) {
    res.send({ error: "something went wrong" });
  }
};

module.exports = {
  orderHistory,
  avaibleProducts,
  insertProducts,
  createOrder,
  deleteOrder,
  getCategories,
  getCategoryProducts,
};
