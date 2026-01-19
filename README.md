# simple-order-engine
# Simple Order Execution Engine

A high-performance backend engine that processes **Market Orders** with simulated DEX routing (Raydium vs. Meteora) and real-time WebSocket status updates.

## 🚀 Features
- **Mock DEX Router**: Compares prices between two liquidity pools and routes to the best one.
- **WebSocket Updates**: Streams order status (`pending` → `routing` → `building` → `confirmed`) in real-time.
- **Concurrency**: Built with Fastify to handle asynchronous order processing.

## 🧠 Design Decisions

### Why Market Orders?
I chose to implement **Market Orders** because they demonstrate the critical path of high-frequency trading: minimizing latency between order submission, routing, and execution. Unlike Limit orders which sit idle, Market orders require immediate synchronization between the pricing engine and the execution queue, making them ideal for showcasing the system's throughput and real-time WebSocket capabilities.

### Extensibility
This engine is designed to be modular.
- **To support Limit Orders:** We would add a "Price Monitor" worker that polls prices periodically and only pushes jobs to the execution queue when the target price is met.
- **To support Sniper Orders:** We would add a "Mempool Listener" to trigger the queue immediately upon detecting a specific liquidity injection transaction.

## 🛠️ Tech Stack
- **Runtime:** Node.js (TypeScript)
- **Framework:** Fastify
- **Communication:** WebSockets (`@fastify/websocket`) & HTTP
- **Architecture:** In-memory Queue & Mock Router

## ⚡ How to Run

### 1. Prerequisites
Ensure you have Node.js installed on your machine.

### 2. Installation
```bash
# Install dependencies
npm install
