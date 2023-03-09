const express = require('express');
//const path = require('path');
const router = express.Router();




router.post('/add-news', (req, res) => {
    const { title, content } = req.body;
    news.push({ title, content });
    res.redirect('/');
});

router.post('/delete-news', (req, res) => {
    const { title } = req.body;
    news.splice(news.findIndex(n => n.title === title), 1);
    res.redirect('/');
});



module.exports = router;