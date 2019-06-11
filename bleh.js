const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const pathname = require("path");
const MongoClient = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017/mychatdb";

//Express Way
// const server = app.listen(5000)
// const io = require("socket.io")(server);
//

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

const users = [];
io.on("connection", socket => {
  socket.on("setUsername", data => {
    if (users.indexOf(data) > -1) {
      socket.emit("userExists", data + " username is taken!");
    } else {
      users.push(data);
      socket.emit("userSet", { username: data });
      socket.broadcast.emit("joined", data);
      MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        const dbo = db.db("mychatdb");
        dbo
          .collection("chats")
          .find({}, { projection: { _id: 0, username: 1, message: 1 } })
          .toArray((err, result) => {
            if (err) throw err;
            console.log(result);
            db.close();
          });
      });
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
    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      const dbo = db.db("mychatdb");
      const myobj = { username: data.user, message: data.message };
      dbo.collection("chats").insertOne(myobj, (err, res) => {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      });
    });
  });

  app.get("/data", (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
      const dbo = db.db("mychatdb");
      dbo
        .collection("chats")
        .find({}, { projection: { _id: 0, username: 1, message: 1 } })
        .toArray((err, result) => {
          if (err) throw err;
          res.json(result);
          db.close();
        });
    });
  });

  //Send Message

  //Recieve Message
});

http.listen(PORT, () => console.log("Server Started in " + PORT));
