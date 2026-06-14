# Premium Point of Sale (POS) System

A modern, high-performance, and feature-rich Point of Sale (POS) system built using a Spring Boot backend, a Next.js (React) frontend, and Docker-orchestrated services.

---

## 🚀 Key Features

* **Real-time Inventory Management:** Perform CRUD operations on products, categories, and suppliers.
* **Virtual Checkout Cart:** Responsive POS shopping cart interface with instant tax and total calculation.
* **Advanced Analytics Dashboard:** Visualized reporting with interactive revenue trend line charts and payment channel donut charts.
* **Role-Based Access Control (RBAC):** Restrict system usage to distinct roles:
  * **Admin:** Full privileges, user management, financial reports.
  * **Manager:** Product management, stock controls, and suppliers.
  * **Cashier:** Process checkouts, view cart operations, and print receipt logs.
* **Optimized Performance:** Sub-millisecond read operations powered by Redis caching.
* **Local Media Support:** Easy-to-use image upload storage with helper scripts for category images.

---

## 🛠️ Technology Stack

### Backend
* **Language & Framework:** Java 21 / 25, Spring Boot 3.3.5
* **Security:** Spring Security & JWT (JSON Web Tokens)
* **Data Access:** Spring Data JPA, Hibernate
* **Database:** MySQL 8.0
* **Caching:** Redis 7.0 (Spring Cache)

### Frontend
* **Framework:** Next.js (TypeScript) & React
* **Styling:** CSS & Tailwind CSS
* **State Management:** Zustand
* **Charts:** SVG custom interactive charts (Sales and Payment distribution)
* **HTTP Client:** Axios

### Containerization
* **Orchestration:** Docker & Docker Compose

---

## 📂 Project Structure

```text
├── pos-backend/                # Spring Boot REST API
│   ├── src/                    # Java Source Files
│   ├── uploads/                # Local Image storage folder for product images
│   ├── Dockerfile              # Docker build file for backend
│   └── pom.xml                 # Maven dependency descriptor
│
├── pos-frontend/               # Next.js Web App
│   ├── src/                    # TypeScript / React source files
│   ├── Dockerfile              # Docker build file for frontend
│   └── package.json            # Node project configuration
│
├── docker-compose.yml          # Multi-container orchestration config
├── download_real_images.js     # Script to seed real-world images to uploads/
├── write_svg_placeholders.js   # Script to generate SVG image placeholders
└── README.md                   # Project documentation
```

---

## ⚡ Getting Started

### Option A: Run using Docker Compose (Recommended)

Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/sandundimantha/POS-system.git
   cd POS-system
   ```

2. **Run All Services:**
   In the root directory, execute:
   ```bash
   docker-compose up --build
   ```

3. **Access the Applications:**
   * **Frontend Web App:** [http://localhost:3000](http://localhost:3000)
   * **Backend API Documentation/Base:** [http://localhost:8080](http://localhost:8080)

---

### Option B: Running Locally (Development Mode)

#### 1. Database & Cache Services
You can run MySQL and Redis natively or run only their containers:
```bash
docker-compose up -d mysql-db redis-cache
```

#### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd pos-backend
   ```
2. Make sure your local database is configured in `src/main/resources/application.yml` (default `username: root`, `password: `).
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   * *Note: The database will be automatically seeded by [DatabaseSeeder.java](pos-backend/src/main/java/com/pos/config/DatabaseSeeder.java) on start.*

#### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../pos-frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the client at [http://localhost:3000](http://localhost:3000).

---

## 🔒 Default Credentials (Seeded)

The system is automatically pre-loaded with three test roles:

| Username | Password | Role |
| :--- | :--- | :--- |
| **admin** | `admin123` | Admin (Full Access) |
| **manager** | `manager123` | Manager (Inventory & Suppliers) |
| **cashier** | `cashier123` | Cashier (POS & Sales) |

---

## 🛡️ License

This project is licensed under the MIT License.
