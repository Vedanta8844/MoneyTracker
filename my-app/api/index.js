const express = require('express')
const app = express()
const port = 4040
const cors = require('cors');



const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();


const User = require('./models/User.js');
const Transaction = require('./models/Transaction.js');


app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));



app.get('/api/test', (req, res) => {
    res.json('TestWorking')
});


app.post('/api/signup', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: 'Username already exists' });

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ username, password: hashedPassword });
        res.json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.post('/api/login', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json({ message: "Login successful", username: user.username });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.post('/api/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    req.session.destroy(() => {
        res.json({ message: 'Logout successful' });
    });
});








app.post('/api/transaction', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        const { username, name, description, datetime, price } = req.body;
        if (!username) return res.status(400).json({ error: "Username is required" });

        const transaction = await Transaction.create({ username, name, description, datetime, price });
        res.json(transaction);

    } catch (error) {
        console.error("Transaction Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.get('/api/transactions/:username', async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const { username } = req.params;
        if (!username) return res.status(400).json({ error: "Username is required" });

        const transactions = await Transaction.find({ username });


        res.json(transactions);
    } catch (error) {
        console.error("Fetch Transactions Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});





app.listen(port);

//mongo passoword: RkUTC73XULuprHDk