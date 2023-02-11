const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const news = [];

app.get('/', (req, res) => {
    res.render('newsfeed', { title: 'Newsfeed', news });
});

app.get('/admin', (req, res) => {
    res.render('admin', { title: 'Admin Page' });
});

app.post('/add-news', (req, res) => {
    const { title, content } = req.body;
    news.push({ title, content });
    res.redirect('/');
});

app.post('/delete-news', (req, res) => {
    const { title } = req.body;
    news.splice(news.findIndex(n => n.title === title), 1);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Newsfeed app listening on port 3000!');
});