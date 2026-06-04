# 🚀 API Monitoring System

A full-stack **API Monitoring & Logging System** built with Node.js, Express, MongoDB, PostgreSQL, and RabbitMQ.  
This system tracks API requests, processes events via queue, and stores structured logs for analytics and monitoring.

---

## 📌 Features

- 🔍 Real-time API request monitoring
- 📊 Logging & analytics system
- 🐇 RabbitMQ-based async event processing
- 🗄️ MongoDB for logs & unstructured data
- 🐘 PostgreSQL for relational data
- 🐳 Docker support for services
- ⚡ Scalable microservice-ready architecture
- 🧠 Centralized error tracking & reporting

---

## 🏗️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + PostgreSQL
- **Queue System:** RabbitMQ
- **Containerization:** Docker & Docker Compose
- **Logging:** Winston / Custom Logger
- **Environment Config:** dotenv / config

---

## 📂 Project Structure

```bash
server/
│── src/
│   ├── config/          # DB & service configs
│   ├── controllers/     # API controllers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── models/          # DB models (Mongo + PG)
│   ├── middleware/      # Auth & logging middleware
│   ├── queue/           # RabbitMQ producer/consumer
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── docker-compose.yml
├── Dockerfile
├── .env
└── package.json