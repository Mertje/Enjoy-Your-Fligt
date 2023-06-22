const express = require("express");
const webshopController = require("../controllers/webshopController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// localhost:3000/webshop
router.get("/", authenticateToken, (req, res) => {
  res.sendFile("pages/shop.html", { root: "public" });
});

router.get("/avaibleProducts", webshopController.avaibleProducts);

router.post("/newproducts", webshopController.insertProducts);

router.post("/new_order", authenticateToken, webshopController.createOrder);

router.get("/orderHistory", authenticateToken, webshopController.orderHistory);

router.get("/categories", authenticateToken, webshopController.getCategories);

router.post("/deleteOrder", authenticateToken, webshopController.deleteOrder);

router.get("/:cat", authenticateToken, webshopController.getCategoryProducts);

module.exports = router;
