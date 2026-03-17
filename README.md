# Mycelial Mania – E-Commerce Web Application

## Overview  
Mycelial Mania is a full-stack e-commerce web application developed as part of a university course project. The application simulates an online store for mycelium growing kits, allowing users to place orders, track their purchases, and interact with a simple administrative interface.

This project demonstrates core concepts in web development, including server-side rendering, RESTful API design, and basic data management.

---

## Features  

- Order placement with input validation  
- Order tracking by ID  
- Admin dashboard to view and filter orders  
- REST API for creating, updating, and canceling orders  
- Server-side rendering using Pug templates  
- Middleware logging for request tracking  

---

## Technologies Used  

- Node.js  
- Express.js  
- Pug (template engine)  
- JavaScript  
- MySQL (original implementation)  

---

## Demo Mode (Important)  

This repository is configured to run in a simplified demo mode using mock data instead of a live database.

The original version of this project connected to a university-hosted MySQL database through an SSH tunnel. Since that environment is not publicly accessible, database functionality has been replaced with in-memory mock data to allow the application to run locally without additional setup.

All database-related code has been preserved (commented out) to demonstrate the full implementation.

---

## How to Run Locally  

Install dependencies:
```
npm install
```

Start the server:
```
node server.js
```

Open in browser:
```
http://localhost:4131
```

Admin dashboard:
```
http://localhost:4131/admin/orders
```

---

## Project Structure  

- `server.js` – Main application server and routing logic  
- `data.js` – Data access layer (mock data + original database code)  
- `templates/` – Pug templates for rendering views  
- `resources/` – Static assets (CSS, JS, images)  

---

## Notes  

- This project was developed for educational purposes  
- Database functionality is simulated in demo mode  
- Sensitive credentials and SSH configurations have been removed  

---

## Author  

Angela Lenling  
