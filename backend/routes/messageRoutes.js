const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const {
  sendMessage,
  allMessages,
} = require("../controllers/messageControllers");
const router = express.Router();

router.route("/").post(protect, sendMessage); //protect: only auth users can send messages
router.route("/:chatId").get(protect, allMessages); //protect: only auth users can send messages

module.exports = router;
