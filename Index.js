const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const dotenv=require('dotenv');
const DbConnect = require("./DbConnect");
const AuthRouter = require("./Router/AuthRouter");
const RestaurantRouter = require("./Router/RestaurantRouter");
const TableRouter = require("./Router/TableRouter");
const MenuRouter = require("./Router/MenuRouter");
const CategoryRouter = require("./Router/CategoryRouter");
const OrderRouter = require("./Router/OrderRouter");
const UserRouter=require("./Router/UserRouter");
const OtpRouter=require('./Router/OtpRouter');
const AssistantRouter=require('./Router/AssistantRouter')
const NotificationRouter=require('./Router/NotificationRouter');
const menuDescriptionRouter=require('./Router/MenudescriptionRouter')
const DashBoardController=require('./Router/DashBoardRouter')
const morgan = require("morgan");
const { Socket } = require("dgram");
const { initializeSocket } = require("./Utils/Socket");
const cloudinary=require('cloudinary').v2;
const cookieParser = require('cookie-parser');


dotenv.config('./');

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});  

const app = express();
const server = http.createServer(app);

initializeSocket(server)

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:3001", "http://localhost:3000"], // Allowed origins for Socket.IO
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });



app.use(morgan("common"));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

// app.use(
//   cors({
//     credentials: true,
//     origin: function (origin, callback) {
//       // Check if the origin is in the allowed list
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true); // Allow the request
//       } else {
//         callback(new Error("Not allowed by CORS")); // Reject the request
//       }
//     },
//   })
// );

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      console.log("🔥 Incoming Origin:", origin);
      console.log("✅ Allowed Origins:", allowedOrigins);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// const allowedOrigin = "https://restro-side.netlify.app"; // Hardcoded for testing

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || origin === allowedOrigin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// }));

app.use("/auth", AuthRouter);
app.use("/assistant",AssistantRouter)
app.use("/restaurant", RestaurantRouter);
app.use("/table", TableRouter);
app.use("/menu", MenuRouter);
app.use("/category", CategoryRouter);
app.use("/order", OrderRouter);
app.use('/owner',UserRouter);
app.use('/otp',OtpRouter);
app.use('/notification',NotificationRouter);
app.use('/dashboard',DashBoardController)
app.use('/generate',menuDescriptionRouter);

app.get("/", (req, res) => {
  res.status(200).send("socket.Io server is running");
});

// io.on("connection", (socket) => {
//   console.log(`Client connected: ${socket.id}`);

//   // Handle restaurant joining a room
//   socket.on("joinRoom", ({ restaurantId }) => {
//     socket.join(restaurantId); // Add the client to the restaurant's room
//     console.log(`Socket ${socket.id} joined room: ${restaurantId}`);
//   });

//   // Handle new order placement
//   socket.on("orderPlaced", (order) => {
    
//     // Emit the new order event only to the specific restaurant's room
//     const restaurantId = order.order.restaurant; // Ensure the order includes the restaurantId
//     if (restaurantId) {
//       io.to(restaurantId).emit("newOrder", order);
//       console.log(`Order broadcasted to room: ${restaurantId}`);
//     } else {
//       console.log("Error: No restaurantId provided in the order");
//     }
//   });

  

//   // Handle client disconnection
//   socket.on("disconnect", () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });

const PORT = 4001;
DbConnect().then(() => {
  server.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
  });
});

// app.listen(PORT,()=>{
//     console.log(`listening to port ${PORT}`);
// })

// console.log(io);
