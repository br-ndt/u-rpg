import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import rootRouter from "./routes/rootRouter.js";
import { chatMessageSerializer, actorMoveSerializer } from "./serializers";
import { clearOccupied, generateMap, setOccupied } from "./utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(
    __dirname,
    process.env.NODE_ENV === "development" ? "../../.env.dev" : "../../.env"
  ),
});

const port = process.env.PORT || 8000;
const app = express();

// express middlewares
app.use(cors());
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(rootRouter);

const server = http.createServer(app);
const io = new Server(server);

const grid = generateMap(10, 10);

setOccupied({ id: 1, name: "Pebberdunker", size: "Small" }, grid, {
  x: 4,
  y: 3,
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on("chat message", (message) => {
    if (chatMessageSerializer(message)) {
      io.emit("message broadcast", { text: message, id: socket.id });
    }
  });
  socket.on("load board", () => {
    io.to(socket.id).emit("board update", grid);
  });
  socket.on(
    "actor move",
    (actor: Actor, fromCoords: Coordinates, toCoords: Coordinates) => {
      if (actorMoveSerializer(actor, grid, toCoords)) { //TODO: make serializer care about fromCoords
        clearOccupied(grid, fromCoords);
        setOccupied(actor, grid, toCoords);
        io.emit("chat message", `Made a move to ${toCoords.x},${toCoords.y}`);
        io.emit("board update", grid);
      }
    }
  );
});

io.on("connect_error", (socket) => {
  console.warn(`Connection Error: ${socket.id}`);
});

server.listen(port, () => console.log(`Server listening on port ${port}`));
