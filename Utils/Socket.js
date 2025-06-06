const { Server } = require("socket.io");

let io; // Declare io variable

const initializeSocket = (server) => {


  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
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
