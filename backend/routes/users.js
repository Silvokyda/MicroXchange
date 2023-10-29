const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

// Connection to MongoDB and selecting the database
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    return client.db("microxchange").collection("users");
  } catch (error) {
    console.error("Error connecting to MongoDB: ", error);
  }
}

// Route for user registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const usersCollection = await connectToDatabase();

  const existingUser = await usersCollection.findOne({ email: email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = { username, email, password };
  const inserted = await usersCollection.insertOne(newUser);

  res.status(201).json({ message: 'User registered successfully', user: inserted.ops[0] });
});

// Route for user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const usersCollection = await connectToDatabase();

  const user = await usersCollection.findOne({ email: email, password: password });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.status(200).json({ message: 'Login successful', user });
});

module.exports = router;