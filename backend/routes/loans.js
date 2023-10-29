const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

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

// Route for loan application
router.post('/apply', async (req, res) => {
  const { userId, amount, duration } = req.body;

  if (!userId || !amount || !duration) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const loansCollection = await connectToDatabase();

  const userLoan = { userId: ObjectId(userId), amount, duration, status: 'pending' };
  const inserted = await loansCollection.insertOne(userLoan);

  res.status(201).json({ message: 'Loan application submitted', loan: inserted.ops[0] });
});

// Route to get user's loans
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  const loansCollection = await connectToDatabase();
  const userLoans = await loansCollection.find({ userId: ObjectId(userId) }).toArray();

  res.status(200).json({ loans: userLoans });
});

module.exports = router;