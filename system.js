const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
console.log(__dirname);
const news = [];
const someRouter = require('./routes/pages');
console.log('done')
app.use(someRouter);




app.listen(3000, () => {
    console.log('Newsfeed app listening on port 3000!');
});