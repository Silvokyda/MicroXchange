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

    const loansCollection = client.db("microxchange").collection("laons");
    // Fetch all data from the "loans" collection
    const allLoans = await loansCollection.find({}).toArray();
    console.log("All data from 'loans' collection:", allLoans);

    return loansCollection;
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
  console.log('Received userId:', userId);

  const loansCollection = await connectToDatabase();

  try {
    const userLoans = await loansCollection.find({ "userId": userId }).toArray(); 
    console.log('Fetched user loans:', userLoans);
    res.status(200).json({ loans: userLoans });
  } catch (error) {
    console.error("Error fetching user loans:", error);
    res.status(500).json({ error: "Failed to fetch user loans" });
  }
});



module.exports = router;