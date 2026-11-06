# 🐾 PawConnect – Animal Rescue & Adoption Platform

PawConnect is a full-stack web application designed to connect animals in need with people willing to rescue, adopt, or provide them with a loving home.

The platform allows users to report animals requiring rescue, submit animals for adoption, and apply to adopt listed animals. Administrators can manage rescue reports, review adoption applications, and approve or reject adoption listings.

## ✨ Features

### User Features
- Browse animals available for adoption.
- Filter animals by type (Dog/Cat).
- View animal details.
- Submit animal rescue reports with photos.
- List animals for adoption.
- Submit adoption applications.

### Admin Features
- Secure admin login using JWT authentication.
- Admin dashboard for managing rescue reports.
- Search and sort rescue reports.
- Update rescue report statuses.
- Review adoption applications.
- Approve or reject adoption applications.
- Review, approve, reject, and delete adoption listings.

## 🛠️ Tech Stack

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- Multer (File Uploads)

**Database**
- MySQL

## 📁 Project Structure

```text
PawConnect/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
│
├── server/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/ManikaDevrani/PawConnect.git
cd PawConnect
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd PawConnect/server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` folder and configure the database credentials, JWT secret, and other environment variables required by the backend.

Never upload your `.env` file to GitHub.

### 5. Set up the MySQL database

Create the database and required tables using the SQL schema used by the project.

### 6. Start the backend

```bash
cd server
npm run dev
```

### 7. Start the frontend

```bash
cd client
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🎯 Project Objective

The objective of PawConnect is to provide a simple digital platform that encourages animal rescue and adoption while making it easier to manage rescue requests and adoption applications.

## 👩‍💻 Developer

**Manika Devrani**

B.Tech Computer Science and Engineering

GitHub: https://github.com/ManikaDevrani
