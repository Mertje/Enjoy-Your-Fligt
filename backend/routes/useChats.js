const express = require("express");
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// localhost:3000/chats
router.get("/", authenticateToken, (req, res) => {
  res.sendFile("pages/chat.html", { root: "public" });
});

router.post("/createSingle", authenticateToken, userController.createSingleChat);

router.post("/unblockUser", authenticateToken, userController.unblockUser);

router.post("/leaveGroup", authenticateToken, userController.leaveGroup);

router.post("/blockUser", authenticateToken, userController.blockUser);

router.post("/newMessage", authenticateToken, userController.newMessage);

router.post("/getSomeUsers", authenticateToken, userController.getAllUsersNotInGroup);

router.post("/addUsersGroup", authenticateToken, userController.addUserToGroup);

router.post("/newMessage", authenticateToken, userController.newMessage);

router.post("/updateGroup", authenticateToken, userController.updateGroupName);

router.get("/group/:groupID", authenticateToken, userController.messageCollection);

router.get("/all", authenticateToken, userController.allUsers);

module.exports = router;
