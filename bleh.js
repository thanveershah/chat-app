const express = require("express");
const app = express();
const pathname = require("path");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = process.env.PORT || 5000;

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
  socket.on("setUsername", function(data) {
    if (users.indexOf(data) > -1) {
      socket.emit("userExists", data + " username is taken!");
    } else {
      users.push(data);
      socket.emit("userSet", { username: data });
      socket.broadcast.emit("joined", data + " has joined");
    }
    socket.on("disconnect", () => {
      socket.broadcast.emit("left", data + " has left");
    });
  });

  socket.on("msg", data => {
    io.sockets.emit("newmsg", data);
  });
});

http.listen(PORT, () => console.log("Serever Started in " + PORT));
