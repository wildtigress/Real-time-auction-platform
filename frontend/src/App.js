import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
// Change this line back to localhost
const socket = io("http://localhost:4000");
const MY_USER_ID = "user_" + Math.random().toString(36).substr(2, 5);

function ItemCard({ item }) {
  const [bid, setBid] = useState(item.currentBid);
  const [winner, setWinner] = useState(item.highestBidder);
  const [flash, setFlash] = useState(false);
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((item.endTime - Date.now()) / 1000)));

  useEffect(() => {
    // Sync Countdown Timer with Server End Time
    const timer = setInterval(() => {
      const secondsRemaining = Math.max(0, Math.floor((item.endTime - Date.now()) / 1000));
      setTimeLeft(secondsRemaining);
      if (secondsRemaining <= 0) clearInterval(timer);
    }, 1000);

    // Listen for Real-Time updates
    socket.on('UPDATE_BID', (data) => {
      if (data.itemId === item.id) {
        setBid(data.newBid);
        setWinner(data.highestBidder);
        setFlash(true); // Trigger Visual Feedback
        setTimeout(() => setFlash(false), 800);
      }
    });

    socket.on('BID_ERROR', (data) => {
      alert(data.msg);
    });

    return () => {
      clearInterval(timer);
      socket.off('UPDATE_BID');
      socket.off('BID_ERROR');
    };
  }, [item.id, item.endTime]);

  const handleBid = () => {
    socket.emit('BID_PLACED', {
      itemId: item.id,
      amount: bid + 10,
      userId: MY_USER_ID
    });
  };

  const isWinning = winner === MY_USER_ID;

  return (
    <div className={`card ${flash ? 'flash-green' : ''} ${!isWinning && winner ? 'outbid-border' : ''}`}>
      <h3>{item.title}</h3>
      <p className="timer">
        {timeLeft > 0 ? `⏳ ${timeLeft}s remaining` : "🛑 Auction Closed"}
      </p>
      <h2 className="price">${bid}</h2>

      <div className="badge-container">
        {isWinning && <span className="badge winning">🏆 Winning</span>}
        {!isWinning && winner && <span className="badge outbid">❌ Outbid</span>}
      </div>

      <button
        onClick={handleBid}
        disabled={timeLeft === 0}
        className={isWinning ? 'btn-winning' : ''}
      >
        {timeLeft > 0 ? "Bid +$10" : "Auction Ended"}
      </button>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Initial load of items
    fetch('http://localhost:4000/items')
      .then(res => res.json())
      .then(setItems)
      .catch(err => console.error("Error fetching items:", err));
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Live Bidding Dashboard</h1>
        <p>User ID: <strong>{MY_USER_ID}</strong></p>
      </header>
      <div className="grid">
        {items.map(item => <ItemCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
