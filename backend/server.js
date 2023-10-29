require('dotenv').config();
const express = require('express');
const loansRouter = require('./routes/loans'); 
const usersRouter = require('./routes/users'); 

const app = express();

app.use(express.json());

// Routes
app.use('/loans', loansRouter); 
app.use('/users', usersRouter); 

// Start the server
const PORT = 5000; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
