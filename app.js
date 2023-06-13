const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//stat instance of express
const app = express();
const cors =require('cors')
const session = require('express-session');
require('dotenv').config();

// ...

app.use(cors())
app.use(session({
    secret: 'your-secret-key', // Replace with your own secret key
    resave: false,
    saveUninitialized: true
}));


// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({extended: false}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Create a user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => { // Pass the user object to the template if it exists in the session
    const user = req.session.userId ? {
        username: 'JohnDoe'
    } : null; // Replace with your own logic to fetch the user from the database
    res.render('home', {user: user});
});


app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const {username, password} = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({username: username, password: hashedPassword});
        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.error('Error signing up:', err);
        res.redirect('/signup');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await User.findOne({username: username});
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) { // Assuming you are using sessions, set the user ID in the session
                req.session.userId = user._id;
                res.send('Logged in successfully!');
            } else {
                res.send('Incorrect username or password.');
            }
        } else {
            res.send('Incorrect username or password.');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.redirect('/login');
    }
});

// ...

// Routes
// ...

app.get('/logout', (req, res) => { // Assuming you are using sessions, you can clear the session and redirect to the home page
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
        }
        res.redirect('/');
    });
});

// ...

// Start the server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
