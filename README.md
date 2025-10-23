# 🗂️ CRUD Application with MongoDB (Node.js + Express + Mongoose)

## 📌 Overview
This project is a **CRUD (Create, Read, Update, Delete)** API built using **Node.js**, **Express.js**, and **MongoDB**.  
It follows the **MVC (Model-View-Controller)** architecture, ensuring the application is modular, scalable, and easy to maintain.  
You can host the backend using **MongoDB Atlas** for a cloud-based database solution.

---

# BASE URL
https://hotel-qd7kitlh2-vivianverses-projects.vercel.app

## 🏗️ Project Structure
```
project/
├── controllers/       # Request logic handlers
├── models/            # Mongoose schemas
├── routes/            # API endpoint definitions
├── config/ or src/    # Database connection
├── app.js             # Application entry point
└── .env               # Environment variables
```

---

## 🧰 Requirements
- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/) or MongoDB Atlas
- npm (comes with Node)

### Dependencies
```bash
npm install express mongoose body-parser nodemon dotenv cors morgan
```

---

## ⚙️ Step 1: Setup the Environment
```bash
# Create project folder
mkdir backend_mongo && cd backend_mongo

# Initialize Node project
npm init -y

# Install dependencies
npm install express mongoose body-parser nodemon dotenv
```

If offline:
```bash
npm i ./packages/express-*.tgz ./packages/mongoose-*.tgz ./packages/body-parser-*.tgz ./packages/nodemon-*.tgz ./packages/dotenv-*.tgz
```

---

## 🛢️ Step 2: Database Setup

### Option 1: Local MongoDB
Default connection string:
```
mongodb://127.0.0.1:27017/mvc_crud_example
```

### Option 2: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.  
2. Build a Cluster (M0).  
3. Add a Database User (username/password).  
4. Allow network access from `0.0.0.0/0`.  
5. Copy the SRV connection string from **“Connect your application.”**

Example:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

---

## 🧩 Step 3: Project Files

### `config/db.js` or `src/db.js`
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mvc_crud_example', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed', err);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 🧠 Step 4: Model Layer (`models/userModel.js`)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

---

## 🧭 Step 5: Controller Layer (`controllers/userController.js`)
```javascript
const User = require('../models/userModel');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
```

---

## 🚦 Step 6: Route Layer (`routes/userRoutes.js`)
```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUser);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
```

---

## 🚀 Step 7: Application Entry (`app.js`)
```javascript
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(bodyParser.json());
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 🌿 Step 8: Environment File (`.env`)
```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/mvc_crud_example
```

For MongoDB Atlas:
```
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

---

## 🧪 Step 9: Testing the API
Use [Postman](https://www.postman.com/) or curl.

- **Create User**  
  `POST /api/users`  
  ```json
  { "name": "Alice", "email": "alice@example.com", "age": 30 }
  ```

- **Get All Users**  
  `GET /api/users`

- **Get One User**  
  `GET /api/users/:id`

- **Update User**  
  `PUT /api/users/:id`

- **Delete User**  
  `DELETE /api/users/:id`

---

## ☁️ Step 10: Hosting the API (MongoDB Atlas)
1. Push code to your Git repository.  
2. Use hosting platforms like [Render](https://render.com/), [Railway](https://railway.app/), or [Vercel](https://vercel.com/).  
3. Set `MONGO_URI` in environment variables.  
4. Deploy and test your API.

---

## 🧭 MVC Recap
- **Model** → Database schema & queries  
- **Controller** → Business logic & error handling  
- **Routes** → API endpoints  
- **Config** → DB connection  

✅ Modular  
✅ Scalable  
✅ Maintainable

---

## 🧑‍💻 Author
- Instructor Guide Reference  
- CRUD with MongoDB and API Hosting Step-by-Step Documentation  

📬 *Feel free to contribute or modify for your own projects.*
