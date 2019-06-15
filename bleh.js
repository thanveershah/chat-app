const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const pathname = require("path");

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.sendFile(pathname.join(__dirname, "chat.html"));
});

const users = [];
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
});

http.listen(PORT, () => console.log("Server Started in " + PORT));
