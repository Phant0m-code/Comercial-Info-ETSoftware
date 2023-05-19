const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const multer = require('multer');
const mongoose = require('mongoose');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const uploadDir = 'public/img/upl/';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const mongoClient = new MongoClient('mongodb+srv://admin:admin@cluster0.bxccpdz.mongodb.net/?retryWrites=true&w=majority');
mongoClient.connect();
const db = mongoClient.db('NewsDB');
const newsCollection = db.collection('newsC');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

console.log(__dirname);

const someRouter = require('./routes/pages');
console.log('done');
app.use(someRouter);

// Add the middleware function to handle errors
app.use(errorHandler);

function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).redirect('/login');
}

// Set up session middleware
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false
    })
);

// Set up passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

dotenv.config({ path: './.env' });

// Set up static folder for public assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'img')));

// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Configure passport to use a local authentication strategy
passport.use(
    new LocalStrategy((username, password, done) => {
        // Implement your authentication logic here
        if (username === 'a' && password === 'a') {
            return done(null, { id: 1, username: 'a' });
        } else {
            return done(null, false, { message: 'Invalid username or password' });
        }
    })
);

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

// Configure Multer to handle picture uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/img/upl/'); // Specify the directory to store uploaded pictures
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename for each uploaded picture
    }
});
//http://localhost:3000/img/upl/1684486407232-logow.png
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit the picture file size to 5 MB
    fileFilter: function(req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']; // Specify the allowed picture file types
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF and mp4 files are allowed.'), false);
        } else {
            cb(null, true);
        }
    }
});

// Add a new API endpoint for uploading a picture
app.post('/api/picture', upload.single('picture'), (req, res) => {
    if (req.file) {
        const pictureUrl = req.protocol + '://' + req.get('host') + './img/upds/' + req.file.filename; // Generate the picture URL
        res.json({ pictureUrl: pictureUrl }); // Return the picture URL to the client
    } else {
        res.status(400).json({ error: 'No picture uploaded.' });
    }
});

// Add a new API endpoint for adding a news item with a picture
app.post('/api/news', upload.single('picture'), (req, res) => {
    const newsItems = {
        title: req.body.title,
        hashtag: req.body.hashtag,
        content: req.body.content,
        picture: req.file ? req.protocol + '://' + req.get('host') + '/img/upl/' + req.file.filename : undefined // Save the picture URL in the news item if a picture is uploaded
    };
    newsCollection.insertOne(newsItems, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error adding news item');
        } else {
            const insertedNewsItem = result.ops[0];
            res.json(insertedNewsItem);
        }
    });
});

// Define a protected route for the admin page
app.get('/admin', isAuthenticated, isAdmin, async(req, res) => {
    try {
        const newsItems = await newsCollection.find().toArray();
        res.render('admin', { newsItems });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving news items');
    }
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

// Get all news items
app.get('/', async(req, res) => {
    try {
        const newsItems = await newsCollection.find().toArray();
        res.render('mainpage', { newsItems });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving news items');
    }
});

// Delete news item
app.delete('/api/news/:id', (req, res) => {
    const id = req.params.id;
    const idToKill = new ObjectId(id);
    newsCollection.deleteOne({ _id: idToKill }, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting news item');
        } else {
            console.log('Item deleted');
            const deletedNewsItem = { _id: id };
            res.json(deletedNewsItem);
        }
    });
});

app.listen(3000, () => {
    console.log('Newsfeed app listening on port 3000!');
});