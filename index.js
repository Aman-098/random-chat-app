const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');  // Import the 'path' module
const { Socket } = require('dgram');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  // Use res.sendFile to send the HTML file
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const connectedUsers = new Set();
const connetedPairs=new Set();
// const connectedPairs = {};

io.on("connection", (socket) => {
  console.log(" A user connected",socket.id)

  connectedUsers.add(socket.id)


  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');

    //remove the user from connected users and connected pairs
    connectedUsers.delete(socket.id);
    const partnerId=findPartner(socket.id);

    if(partnerId){
      connectedPairs.delete(generatePairKey(socket.id, partnerId));
      // Notify the partner about the disconnection
      io.to(partnerId).emit('partnerDisconnected');
    }

  });

  //find random connection
  socket.on("findRandomConnection", () => {
    // Added my id inti set
    connetedPairs.add(socket.id)
    console.log(`user ${socket.id} is searching for available users`)
    const availableUsers = Array.from(connectedUsers).filter((id) => id !== socket.id)

    if (availableUsers.length > 0 ) {
    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    
    if(connetedPairs.size <=2) {
    io.to(randomUser).emit('randomConnection', { partnerId: socket.id });
    connetedPairs.add(randomUser)
    socket.emit('randomConnection', { partnerId: randomUser })
    console.log(`User ${socket.id} is connected with ${randomUser}`);
    } else {
      console.log("Two already connected");
    }
    }
    else {
      socket.emit('noRandomConnection')
    }
  })
  // handle chat message 

  socket.on('chatMessage',(data)=>{
    const {partnerId,message}=data;
    io.to(partnerId).emit('chatMessage',{senderId: socket.id, message})
  })
})


