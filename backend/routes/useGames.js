const express = require("express");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// localhost:3000/games
router.get("/", authenticateToken, (req, res) => {
  res.sendFile("pages/games.html", { root: "public" });
});

router.get("/memory", authenticateToken, (req, res) => {
  res.sendFile("pages/memory.html", { root: "public" });
});

router.get("/minesweeper", authenticateToken, (req, res) => {
  res.sendFile("pages/minesweeper.html", { root: "public" });
});

router.get("/tictacto", authenticateToken, (req, res) => {
  res.sendFile("pages/tic_tac_to.html", { root: "public" });
});

router.get("/hangman", authenticateToken, (req, res) => {
  res.sendFile("pages/hangman.html", { root: "public" });
});

module.exports = router;
