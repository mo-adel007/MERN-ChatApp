const express = require("express");
// const { chats } = require("./data/data");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const path = require("path");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");
///////////////////////////////////////////////////

const app = express(); // using express framework
///////////////////////////////////////////////////

dotenv.config(); // using the .env file for keys db and jwt and port
///////////////////////////////////////////////////

connectDB(); // function for the connection of the mongo db

///////////////////////////////////////////////////

app.use(express.json()); // using json in express for postman

///////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.send("API is Running");
});

///////////////////////////////////////////////////

app.use("/api/user", userRoutes); // main api
app.use("/api/chat", chatRoutes); // chat api
app.use("/api/message", messageRoutes); // messagging api

///////////////////////////////////////////////////
// -------------------Deployment -----------------

// const __dirname1 = path.resolve()
// if(process.env.NODE_ENV==='production'){

// } else {

// }

// -------------------Deployment -----------------

///////////////////////////////////////////////////
// middlewares for user not found
app.use(notFound); // middleware logic function
app.use(errorHandler); //middleware logic function

///////////////////////////////////////////////////

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`));

///////////////////////////////////////////////////
// installing the Socket
///////////////////////////////////////////////////

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});
///////////////////////////////////////////////////
// on connection functionallity
///////////////////////////////////////////////////

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  ///////////////////////////////////////////////////
  // connecting the frontend on setup functionally
  ///////////////////////////////////////////////////

  socket.on("setup", (userData) => {
    // users on joining room functionallty
    socket.join(userData._id);
    // console.log(userData._id);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User Joined Room :  ${room}`);
  });

  // socket for the typing and stoping typing
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    // real time message (applying a new message to the chat)
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users is not defined");

    ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////

    chat.users.forEach((user) => {
      // if the user is the sender dont send to the same user
      if (user._id == newMessageRecieved.sender._id) return;
      // otherwiser emit to another user
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
  socket.off("setup", () => {
    console.log("User Disconnected");
    socket.leave(userData._id);
  });
});
