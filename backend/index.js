const express = require("express");
const app = express();
const path = require("path");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const useChats = require("./routes/useChats");
const useWebshop = require("./routes/useWebshop");
const useLogin = require("./routes/useLogin");
const useBase = require("./routes/useBase");
const useAdmin = require("./routes/useAdmin");
const useGames = require("./routes/useGames");
const os = require("os");

const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));

const dirName = os.platform() === "win32" || os.platform() === "win64" ? __dirname + "/external" : `/media/${os.userInfo().username}/EXTERNAL`;

app.use("/static", express.static(dirName));

app.use("/admin", useAdmin);
app.use("/chats", useChats);
app.use("/webshop", useWebshop);
app.use("/games", useGames);
app.use("/login", useLogin);
app.use("/", useBase);

//Chat app
io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.leaveAll();
    socket.join(room);
  });

  socket.on("message", (data) => {
    io.to(data.data.groupID).emit("message", data);
  });

  socket.on("disconnect", () => {
    io.emit("An user disconnected");
  });

  socket.on("typing", (data) => {
    socket.broadcast.to(data.groupID).emit("typing", data); // Werkt niet goed - Hoort naar elke gebruiker te sturen behalve zender;
  })
});

http.listen(3000, () => console.log("Listening on port 3000"));
