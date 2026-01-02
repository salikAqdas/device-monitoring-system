Below is a **clean, professional, production-ready `README.md`** you can directly copy into your repository.
It explains the project clearly, how to set it up, and how everything works.

---

# 📡 Device Monitoring System

A lightweight, scalable **Device Monitoring System** built using **Node.js**, **PostgreSQL**, and **vanilla JavaScript**.
It monitors device availability, tracks uptime/downtime, stores historical logs, and provides a clean web dashboard.

---

## 🚀 Features

### ✅ Core Features

* Register and manage devices
* Monitor device status (ONLINE / OFFLINE)
* TCP-based connectivity check (reliable & cross-platform)
* Real-time status updates (auto refresh)
* Human-readable offline duration
* Soft device activation/deactivation
* Full CRUD support

### 📊 Logging & History

* Per-ping logging
* Historical status tracking
* Automatic archival of old logs
* Download logs as Excel files

### 🖥️ UI Features

* Tab-based navigation:

  * All Devices
  * Online Devices
  * Offline Devices
  * Logs
* Search by device ID, IP, or location
* Edit / delete devices
* Responsive and clean UI

---

## 🧱 Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Backend    | Node.js, Express             |
| Database   | PostgreSQL                   |
| Frontend   | HTML, CSS, Vanilla JS        |
| Scheduler  | node-cron                    |
| Logging    | PostgreSQL + Excel export    |
| Networking | TCP-based reachability check |

---

## 📁 Project Structure

```
device-monitoring/
│
├── db/
│   └── init.sql                # Database schema
│
├── public/
│   ├── index.html              # UI
│   ├── styles.css
│   └── app.js
│
├── routes/
│   └── deviceRoutes.js
│
├── services/
│   ├── pingService.js
│   ├── pingLogService.js
│   ├── logArchiveService.js
│
├── scheduler/
│   ├── healthCheckScheduler.js
│   └── archiveScheduler.js
│
├── config/
│   └── db.js
│
├── index.js
├── package.json
├── .env
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/device-monitoring-system.git
cd device-monitoring-system
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Setup Environment Variables

Create a `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=devicemonitor
```

---

### 4️⃣ Initialize Database

Run the schema script:

```bash
psql -U postgres -d devicemonitor -f db/init.sql
```

---

### 5️⃣ Start the Application

```bash
npm start
```

Server will start at:

```
http://localhost:3000
```

---

## 📊 Application Flow

### Device Monitoring

1. Devices are added via UI
2. Scheduler checks reachability every 30 seconds
3. Status is updated in `device_status`
4. Ping results are logged in `device_ping_log`

### Logging & Archival

* Logs older than 2 days are exported to Excel
* Stored in `/logs/archive`
* Automatically removed from DB

---

## 🧠 Database Tables Overview

| Table                   | Purpose                |
| ----------------------- | ---------------------- |
| `devices`               | Master device registry |
| `device_status`         | Current device state   |
| `device_ping_log`       | Raw ping logs          |
| `device_status_history` | Status transitions     |

---

## 🔄 API Endpoints

### Devices

* `GET /api/devices`
* `POST /api/devices`
* `PUT /api/devices/:id`
* `DELETE /api/devices/:id`

### Logs

* `GET /api/devices/logs/recent`
* `GET /api/devices/logs/archive`
* `GET /api/devices/logs/archive/:filename`

---

## 📦 Scripts

```bash
npm start        # Start server
npm run dev      # Dev mode (nodemon)
```

---

## 🛡️ Security Notes

* Uses parameterized SQL queries
* No secrets committed
* Uses environment variables
* No raw SQL exposure to frontend

---

## 🚀 Future Enhancements

* Authentication & RBAC
* WebSocket real-time updates
* Dashboard charts
* Email / Slack alerts
* Docker & Kubernetes deployment
* Role-based dashboards

---

## 📌 Author

Built by **Md Salik Aqdas**
For internal monitoring and infrastructure visibility.

---

## ✅ Status

✔ Stable
✔ Production-ready
✔ Easily extensible

---
