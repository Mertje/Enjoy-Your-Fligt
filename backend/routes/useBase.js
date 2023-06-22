const express = require("express");
const { authenticateToken, checkLogged } = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = express.Router();

// localhost:3000/
router.get("/", checkLogged, (req, res) => {
  res.sendFile("pages/loginpage.html", { root: "public" });
});

// localhost:3000/index
router.get("/index", authenticateToken, (req, res) => {
  res.sendFile("pages/index.html", { root: "public" });
});

router.get("/music_category", authenticateToken, (req, res) => {
  res.sendFile("pages/music_category.html", { root: "public" });
});

router.get("/video", authenticateToken, (req, res) => {
  res.sendFile("pages/video_player.html", { root: "public" });
});

router.get("/movie_data", userController.getMovies);

router.get("/music_data", userController.getMusic);

module.exports = router;
