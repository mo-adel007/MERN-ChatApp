const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const express = require("express");
const router = express.Router();

router.route("/").post(protect, accessChat); // route for create chat API
router.route("/").get(protect, fetchChats); // route for fetch all chats for user API
router.route("/group").post(protect, createGroupChat); // route for creating a group Chat
router.route("/rename").put(protect, renameGroup); // rename a group chat name
router.route("/groupremove").put(protect, removeFromGroup); // remove user from group
router.route("/groupadd").put(protect, addToGroup); // add users to groupChat

module.exports = router;
