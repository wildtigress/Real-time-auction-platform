# 🔨 Real-Time Auction Platform 

A high-performance, containerized bidding application built to demonstrate real-time data synchronization and race-condition handling in a distributed environment.

## 🚀 Key Features

* **Real-Time Bid Updates**: Utilizes **Socket.io** for bidirectional, low-latency communication between the server and multiple clients.
* **Race Condition Mitigation**: Implements server-side validation to ensure that in the event of near-simultaneous bids, only the first valid transaction is processed.
* **Synchronized Countdown Timers**: Auction timers are calculated relative to a server-provided UTC timestamp, ensuring all users see the exact same "Time Left."
* **Dockerized Infrastructure**: Fully orchestrated using Docker Compose for consistent environment setup.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, Socket.io-client, CSS3.
* **Backend**: Node.js, Express, Socket.io.
* **DevOps**: Docker, Docker Compose.

---

## 📦 Installation & Setup

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* Node.js (Optional, only for local development outside Docker).

### Step-by-Step Guide
1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Auction-Project
Spin up the containers:

PowerShell
 docker-compose up --build

 Access the application:

Frontend: http://localhost:3000

Backend API: http://localhost:4000

🧠 Technical Implementation Details
1. Handling Concurrency (Race Conditions)
In a high-traffic auction, two users might bid the same amount at the same millisecond.

The Logic: The backend acts as the single source of truth. Before broadcasting a SUCCESS event, the server performs an atomic check: if (incomingBid > currentServerBid).

The Result: The first packet to reach the CPU sets the new price; the second packet is caught and triggers a BID_ERROR event back to the user, preventing "double-wins."

2. Accurate Time Tracking
Client-side setInterval can drift. We solve this by sending a fixed endTime timestamp from the server. The React component calculates the remaining time using: Math.max(0, endTime - Date.now()) on every tick, ensuring perfect sync across all browsers.

🚦 Testing the Application
Open http://localhost:3000 in two different browser windows.

Place a bid in Window A.

Observe Window B updating the price and showing the "Outbid" status instantly without a refresh.

Watch the timer hit zero to see the "Bid" button disable automatically.
(Live Demo:https://drive.google.com/file/d/1NEapSlzWWmAeW-72qMW1ZvGpdtWU56OI/view?usp=sharing)
