const express= require("express")
const app = express();
const db= require("./config/mongo")
const cors = require("cors");
const path = require("path");
const formUser= require("./routes/userRoute")
const profileUser= require("./routes/profileRoute")
const authRoutes= require("./routes/authRoute")
const patnerRoutes= require("./routes/patnerRoute")
const deleteroutes= require("./routes/DeleteprofileRoute")
const paymentRoutes = require("./routes/PaymentRoute")
const profileByCityRoute = require("./routes/profileByCityRoute")
const http = require('http'); // Import http module for Socket.IO
const socketIo = require('socket.io'); // Import socket.io
const imageRoutes = require("./routes/imageRoutes");
// const clickButton= require("./routes/clickButtonRoute")
const chatRoutes = require("./routes/chat"); // Your new chat routes
const Conversation = require('./model/chat');
const User = require('./model/user');


const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://shaadi-ruby.vercel.app', 'https://www.shaadisanskar.com'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

app.use(cors({
    origin: ['http://localhost:5173', 'https://shaadi-ruby.vercel.app','https://www.shaadisanskar.com'], // Add allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));


//api
app.use("/user",formUser)
app.use("/api", profileUser)
app.use('/api/auth', authRoutes);
app.use("/api/patner", patnerRoutes);
app.use("/delete", deleteroutes);
app.use("/api/payment", paymentRoutes);
// app.use("/click", clickButton);
app.use("/city",profileByCityRoute);
app.use('/chat', chatRoutes);
app.use("/api/images", imageRoutes);
db();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  socket.on('send_message', async (messageData) => {
    console.log('Message received via socket:', messageData);

    try {
      const senderUser = await User.findById(messageData.senderId).select('name image');
      const populatedMessageData = {
        ...messageData,
        sender: {
          _id: senderUser._id,
          name: senderUser.name,
          image: senderUser.image
        },
        timestamp: new Date() 
      };

      socket.to(messageData.conversationId).emit('receive_message', populatedMessageData);

    

    } catch (error) {
      console.error("Error processing socket message:", error);
      
      socket.emit('message_error', { message: 'Failed to process message on server', error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { 
  console.log(`Server is running on port ${PORT}`);
});