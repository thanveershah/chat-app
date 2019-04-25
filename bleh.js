const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const pathname = require("path");
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 5000;

app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(pathname.join(__dirname, "chat.html"));
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





users = [];
io.on('connection', function(socket) {
   console.log('A user connected');
   socket.on('setUsername', function(data) {
      console.log(data);
      
      if(users.indexOf(data) > -1) {
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      } else {
         users.push(data);
         socket.emit('userSet', {username: data});
      }
   });
   
   socket.on('msg', function(data) {
      io.sockets.emit('newmsg', data);
   })

   socket.on("isTyping", () => {
    client.broadcast.emit("typing", "Typing");
  });
  socket.on("notTyping", () => {
    client.broadcast.emit("nottyping", "Stopped");
  });
});


http.listen(PORT, () => console.log(PORT));
