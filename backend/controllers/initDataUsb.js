const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const os = require("os");
const path = require("path");

const prisma = new PrismaClient();

const readJson = async () => {
  const pathToProducts =
    os.platform() === "win32" || os.platform() === "win64"
      ? path.join(__dirname, "..", "external", "products.json")
      : `/media/${os.userInfo().username}/EXTERNAL/products.json`;

  const productData = fs.readFileSync(pathToProducts, (err, data) => {
    if (err) {
      return console.log("Data not found");
    }
    return data;
  });

  const pathToUsers =
    os.platform() === "win32" || os.platform() === "win64"
      ? path.join(__dirname, "..", "external", "users.json")
      : `/media/${os.userInfo().username}/EXTERNAL/users.json`;

  const userData = fs.readFileSync(pathToUsers, (err, data) => {
    if (err) {
      return console.log("Data not found");
    }
    return data;
  });

  const productsParsedData = JSON.parse(productData);
  const usersParsedData = JSON.parse(userData);

  productsParsedData["products"] = productsParsedData["products"].map((element) => {
    element["imageUrl"] = "static/products/" + element["imageUrl"];
    return element;
  });

  const data = await prisma.User.createMany({
    data: usersParsedData.users,
    skipDuplicates: true,
  });

  const category = await prisma.category.createMany({
    data: productsParsedData["category"],
    skipDuplicates: true,
  });

  const products = await prisma.Products.createMany({
    data: productsParsedData["products"],
    skipDuplicates: true,
  });

  const newCategoryProducts = await prisma.CategoryProduct.createMany({
    data: productsParsedData["product_category"],
    skipDuplicates: true,
  });

  const admin = await prisma.admin.createMany({
    data: usersParsedData["workers"],
    skipDuplicates: true,
  });
  await prisma.$disconnect();
};

readJson();
