const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModal");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

///////////////////////////////////////////////////
//sending message controller
///////////////////////////////////////////////////

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body; // the body of the message
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  /////////////creating new message

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latesetMessage: message,
    });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

///////////////////////////////////////////////////
///////////////////////////////////////////////////

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

module.exports = { sendMessage, allMessages };
