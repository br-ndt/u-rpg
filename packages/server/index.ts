import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import Knex from "knex";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

import { DEFAULT_MAP_HEIGHT, DEFAULT_MAP_WIDTH } from "./constants/board.js";
import { sizeRecord } from "./constants/entities.js";
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

const DB_TABLES = ["maps", "actors", "tiles"];

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
const knex = Knex({
  client: "pg",
  connection: {
    host: "localhost",
    port: 5432,
    user: "bearsan",
    database: "bearsan",
  },
});

const hasTables = await Promise.all(
  DB_TABLES.map(async (table) => await knex.schema.hasTable(table))
);

if (!hasTables.filter((table) => table !== false).length) {
  await knex.schema.createTable("maps", (table) => {
    table.increments();
    table.string("name").unique();
    table.integer("width").unsigned().defaultTo(DEFAULT_MAP_WIDTH);
    table.integer("height").unsigned().defaultTo(DEFAULT_MAP_HEIGHT);
    table.timestamps();
  });
  await knex.schema.createTable("actors", (table) => {
    table.increments();
    table.string("name").unique();
    table.enum("size", Object.keys(sizeRecord));
    table.timestamps();
  });
  await knex.schema.createTable("tiles", (table) => {
    table.increments();
    table.bigInteger("mapId").references("maps.id").notNullable();
    table.bigInteger("occupantId").references("actors.id").nullable();
    table.integer("x").unsigned().notNullable();
    table.integer("y").unsigned().notNullable();
    table.timestamps();
  });
}

const grid = generateMap(DEFAULT_MAP_WIDTH, DEFAULT_MAP_HEIGHT);
const map = await knex("maps").returning("id").insert({
  name: "ez",
  width: DEFAULT_MAP_WIDTH,
  height: DEFAULT_MAP_HEIGHT,
});
for (let i = 0; i < DEFAULT_MAP_HEIGHT * DEFAULT_MAP_WIDTH; ++i) {
  const tile = await knex("tiles")
    .returning("id")
    .insert({
      mapId: map,
      occupantId: null,
      x: i % DEFAULT_MAP_WIDTH,
      y: i / DEFAULT_MAP_HEIGHT,
    });
}
const Pebberdunker: Actor = { id: 1, name: "Pebberdunker", size: "Small" };

setOccupied(Pebberdunker, grid, {
  x: 4,
  y: 3,
});
await knex("tiles")
  .where("x", 4)
  .where("y", 3)
  .update({ occupantId: Pebberdunker.id });

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
      if (actorMoveSerializer(actor, grid, toCoords)) {
        //TODO: make serializer care about fromCoords
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
