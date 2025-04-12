const { Server } = require("socket.io");

let io; // Declare io variable

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("joinRoom", ({ restaurantId }) => {
      socket.join(restaurantId.toString());
      console.log(`Socket ${socket.id} joined room: ${restaurantId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized.");
  }
  return io;
};

module.exports = { initializeSocket, getIo };
