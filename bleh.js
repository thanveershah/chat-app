const express = require("express");
const app = express();
const pathname = require("path");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const fs = require("fs");
const PORT = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");

app.get("/", (req, res) => {
  res.sendFile(pathname.join(__dirname, "chat.html"));
});

// io.on("connection", client => {
//   console.log("Client Connected");

//   client.on("join", data => {
//     console.log(data);
//   });

//   client.on("messages", data => {
//     client.emit("broad", data);
//     client.broadcast.emit("broad", data);
//   });

//   client.on("isTyping", () => {
//     client.broadcast.emit("typing", "Typing");
//   });
//   client.on("notTyping", () => {
//     client.broadcast.emit("nottyping", "Stopped");
//   });
// });

var users = [];
io.on("connection", function(socket) {
  console.log("A user connected");
  socket.on("setUsername", function(data) {
    console.log(data);

    if (users.indexOf(data) > -1) {
      socket.emit("userExists", data + " username is taken!");
    } else {
      users.push(data);
      socket.emit("userSet", { username: data });
      socket.emit("joined", data + " has joined");
    }
  });

  socket.on("msg", data => {
    io.sockets.emit("newmsg", data);
    socket.on("isTyping", () => {
      socket.broadcast.emit("typing", "Typing");
    });
    socket.on("notTyping", () => {
      socket.broadcast.emit("nottyping", "Stopped");
    });
  });
});

http.listen(PORT, () => console.log(PORT));
