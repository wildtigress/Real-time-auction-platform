const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*", // This allows any website to connect
    methods: ["GET", "POST"]
  }
});

// Mock Database with fixed timestamps
let items = [
    {
        id: "1",
        title: "Vintage Rolex",
        startPrice: 1000,
        currentBid: 1000,
        highestBidder: null,
        endTime: Date.now() + 120000 // 2 minutes from now
    },
    {
        id: "2",
        title: "MacBook Pro M3",
        startPrice: 1500,
        currentBid: 1500,
        highestBidder: null,
        endTime: Date.now() + 300000 // 5 minutes from now
    }
];

app.get('/items', (req, res) => res.json(items));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('BID_PLACED', ({ itemId, amount, userId }) => {
        const item = items.find(i => i.id === itemId);

        if (!item) return;

        // 1. Check if auction ended using Server Time
        if (Date.now() > item.endTime) {
            return socket.emit('BID_ERROR', { msg: "Auction has ended!" });
        }

        // 2. THE CHALLENGE (Concurrency): Handle the "Race Condition"
        // We validate that the incoming bid is higher than the current state 
        // before any broadcast happens.
        if (amount > item.currentBid) {
            item.currentBid = amount;
            item.highestBidder = userId;

            // Broadcast updated bid to ALL connected clients instantly
            io.emit('UPDATE_BID', {
                itemId,
                newBid: item.currentBid,
                highestBidder: userId
            });
        } else {
            // Rejection for the user who lost the race (even by 1ms)
            socket.emit('BID_ERROR', { msg: "Outbid! Someone placed a bid faster." });
        }
    });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
