const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const pathname = require("path");
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 5000;

app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(pathname.join(__dirname, "public", "chat.html"));
});

io.on("connection", client => {
  console.log("Client Connected");

  client.on("join", data => {
    console.log(data);
  });

  client.on("messages", data => {
    client.emit("broad", data);
    client.broadcast.emit("broad", data);
  });
  
  client.on("isTyping", () => {
    client.broadcast.emit("typing", "Typing");
  });
  client.on("notTyping", () => {
    client.broadcast.emit("nottyping", "Stopped");
  });
});

http.listen(PORT, () => console.log(PORT));
