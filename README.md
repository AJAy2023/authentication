# 🔐 Authentication System (Node.js + Express + MongoDB)

This project implements a complete authentication flow using **JWT access & refresh tokens**, **OTP verification**, and **secure middleware protection**.  
It serves as a solid foundation for any Node.js backend requiring secure user authentication.

---

## 🚀 Features

-  User registration with OTP email verification  
-  OTP resend with rate limiting (2-minute cooldown)  
-  JWT-based Access Token & Refresh Token system  
-  Login and Logout endpoints  
-  Secure middleware for protected routes  
-  Environment variable configuration with `.env`  
-  MongoDB integration using Mongoose  
-  Clean and modular folder structure (Controllers, Routes, Models, Middleware)

---

## 🗂️ Folder Structure

├── controllers/
  . auth.js
  . request.js



├── middleware/
 . verify.js


|── models/
   . user.js,
     otp.js



├── routes/
 .  authRoutes.js
 . requestRoutes.js



├── config/
 . db.js



 .env
 
 server.js
 
 package.json




--- 


---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following:

env
`PORT=5000 `
` MONGO_URI=your_mongodb_connection_string`
` JWT_TOKEN=your_jwt_secret_key` 
` REFRESH_TOKEN=your_refresh_secret_key`
` EMAIL_USER=your_email@example.com ` 
` EMAIL_PASS=your_email_password `


---

Tech Stack:

` Node.js – Runtime environment`
`Express.js – Web framework`
` MongoDB + Mongoose – Database and ODM`
`JWT (jsonwebtoken) – Token-based authentication  `
` Nodemailer – Email service for OTP `
` dotenv – Environment configuration `




 ## Author
 Ajay ❤

