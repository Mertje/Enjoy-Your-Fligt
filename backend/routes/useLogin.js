const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

// localhost:3000/login

router.post("/:ticket_number", authController.login);

// router.post("/create");

module.exports = router;
