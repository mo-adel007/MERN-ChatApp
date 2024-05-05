const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  ///////////////////////////////////////////////////
  const { userId } = req.body;
  if (!userId) {
    // if no user to chat when search
    return res.sendStatus(400);
  }
  ///////////////////////////////////////////////////

  ///////////////////////////////////////////////////

  // get the name with matching its id
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password") // display the username
    .populate("latestMessage"); // get the latest messages
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  ///////////////////////////////////////////////////

  if (isChat.length > 0) {
    // if theres no chat return blank
    res.send(isChat[0]);
  } else {
    var chatData = {
      // with the info of the chat
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    ///////////////////////////////////////////////////
    // create a new chat
    try {
      const createdChat = await Chat.create(chatData);
      // or returning the full chat that exsits and display it
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat); // returning the chat
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});
///////////////////////////////////////////////////
///////////////////////////////////////////////////

// get the chats that is already exists

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } }) // get it by id
      .populate("users", "-password") // return only username of users
      .populate("groupAdmin", "-password") // return the username of the adming
      .populate("latestMessage") // return the messages
      .sort({ updatetAt: -1 })
      ///////////////////////////////////////////////////
      // get the results=(the sender username and the details)

      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// creating a new group chat
const createGroupChat = asyncHandler(async (req, res) => {
  // makes sure that the users added and the name of the group
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all fields" });
  }
  var users = JSON.parse(req.body.users); // returning in JSON

  if (users.length < 2) {
    // validation of group number
    return res.status(400).send("More than 2 users is required");
  }
  users.push(req.user); // user is logged in is a must
  ///////////////////////////////////////////////////
  // creating the group chat
  try {
    // the chat has the following:
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    // fetching the chat from the db to the UI
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    console.log(error);
  }
});
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// rename a groupchat name
const renameGroup = asyncHandler(async (req, res) => {
  // get the chat it
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true, // return the updated value
    }
  )

    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// add users to a group chat

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId }, // pushes the user
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// remove user from group
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId }, // pushes the user
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
