const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require("path");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');

const { MongoClient } = require('mongodb');
const mongoClient = new MongoClient('mongodb+srv://admin:admin@cluster0.bxccpdz.mongodb.net/?retryWrites=true&w=majority');
mongoClient.connect();
const db = mongoClient.db('et-news');
const newsCollection = db.collection('news');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
console.log(__dirname);
const someRouter = require('./routes/pages');
console.log('done')
app.use(someRouter);


// Set up session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
// Set up passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

dotenv.config({ path: './.env' });
// Set up body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Set up static folder for public assets
app.use(express.static(path.join(__dirname, 'public')));

// Configure passport to use a local authentication strategy
passport.use(new LocalStrategy((username, password, done) => {
    // Implement your authentication logic here
    if (username === 'admin' && password === 'admin') {
        return done(null, { id: 1, username: 'admin' });
    } else {
        return done(null, false, { message: 'Invalid username or password' });
    }
}));

// Serialize user object to session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user object from session
passport.deserializeUser((id, done) => {
    done(null, { id: id, username: 'admin' });
});

// Define the login route
app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error') });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
}));

// Define a protected route for the admin page
app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin');
});

// Middleware function to check if a user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Middleware function to check if a user is an admin
function isAdmin(req, res, next) {
    // Implement your authorization logic here
    if (req.user.username === 'admin') {
        return next();
    } else {
        res.redirect('/login');
    }
}





// Handle GET request to display divs
app.get('/', (req, res) => {
    res.render('mainpage')
});










app.listen(3000, () => {
    console.log('Newsfeed app listening on port 3000!');
});