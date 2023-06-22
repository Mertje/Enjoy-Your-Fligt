const express = require("express");
const adminController = require("../controllers/adminController");
const { adminAuthenticateToken, checkLoggedAdmin } = require("../middleware/auth");
const router = express.Router();

// localhost:3000/admin
router.get("/", checkLoggedAdmin, (req, res) => {
  res.sendFile("pages/admin/admin_login.html", { root: "public" });
});

router.get("/index", adminAuthenticateToken, (req, res) => {
  res.sendFile("pages/admin/index.html", { root: "public" });
});

router.post("/login", adminController.adminLogin);

router.get("/order", adminController.adminOrders);

router.get("/all", adminController.adminOrdersAll);

router.get("/toggle", adminController.toggleWifi);

router.put("/delivered", adminController.adminDelivered);

router.get("/all_products", adminController.allproducts);

module.exports = router;
