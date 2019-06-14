const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const pathname = require("path");

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

const users = []
io.on("connection", socket => {
  socket.on("setUsername", data => {
    if (users.indexOf(data) > -1) {
      socket.emit("userExists", data + " username is taken!");
    } else {
      users.push(data);
      socket.emit("userSet", { username: data });
      socket.broadcast.emit("joined", data);
    }
    socket.on("disconnect", () => {
      socket.broadcast.emit("left", data + " has left");
    });
  });

  socket.on("msg", data => {
    io.emit("newmsg", data);
    socket.broadcast.emit("notify everyone", {
      user: data.user,
      comment: data.message
    });
  });

  app.get("/data", (req, res) => {});

  //Send Message

  //Recieve Message
});

http.listen(PORT, () => console.log("Server Started in " + PORT));
