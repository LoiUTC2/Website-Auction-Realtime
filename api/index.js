// index.js

const express = require("express");
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnect = require('./config/dbConnect');
const errorHandler = require('./middlewares/errorMiddleware');
const redisClient = require('./config/redis');
const cloudinary = require('cloudinary').v2;
const { initializeSocket } = require('./controllers/socket.controller');
const { initializeAuctionSync, initializeAuctionSystem } = require("./common/initializeAuctionSync");

// Tạo server http
const server = http.createServer(app);

// Khởi tạo Socket.IO
const io = socketIo(server, {
    cors: {
        // origin: "http://localhost:3033", 
        origin: ["http://localhost:3033", process.env.REACT_APP_CLIENT_URL], 
        methods: ["GET", "POST"],
        credentials: true
    }
});
initializeSocket(io);


cloudinary.config({
    secure: true
});

// Connect db
dbConnect();

// Connect redis server in docker
redisClient.connect();

//Define routes
const authRoute = require("./routes/auth.route");
const userRoute = require("./routes/user.route");
const roleRoute = require("./routes/RoleRoute");
const customerRoute = require("./routes/CustomerRoute");
const paymentRoute = require("./routes/payment.route");
const auctionRoute = require("./routes/auction.route");
const resourceRoute = require("./routes/resouce.rote");
const notificatonRoute = require('./routes/notificaton.route');
const { verifySocketToken } = require("./middlewares/Authentication");


// Config server
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
const corsOptions = {
    origin: [
        process.env.REACT_APP_CLIENT_URL,
        process.env.REACT_APP_ADMIN_URL,
        'http://localhost:3033',
    ],
    credentials: true,
    exposedHeaders: ['x-new-access-token', 'x-token-resetpassword'],
};
// app.use(cors(corsOptions));
app.use(cors(corsOptions));
//Sync data khi start server
initializeAuctionSystem();

//Use routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use("/api/customers", customerRoute);
app.use("/api/auctions", auctionRoute);
app.use("/api/resource", resourceRoute)
app.use('/api/role', roleRoute);
app.use("/api/payment", paymentRoute)
app.use("/api/notifications", notificatonRoute)

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server start in PORT ${PORT}`);
});