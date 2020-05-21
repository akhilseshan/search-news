const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const axios = require('axios');
const Articles = require('./models/articles');

topics = ['Technology', 'Business', 'Covid', 'Bitcoin', 'Apple', 'Stocks', 'Startup', 'Funding', 'Football'];

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

mongoose.connect(keys.mongodb.dbURI,{ useUnifiedTopology: true, useNewUrlParser: true }, () => {
    console.log('connected to mongodb');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/search', async (req, res) => {
    const searchResults = await Articles.find({ $text: { $search: req.body.searchTopic } })
    if(searchResults == null) return res.redirect('/load');
    res.render('searchresults', {searchResults: searchResults});
})

app.get('/load', (req, res) => {
    topics.forEach(topic => {
        axios.get('https://newsapi.org/v2/everything?q='+topic+'&apiKey='+keys.newsapi.apiKey)
        .then(response => {
          Articles.insertMany(response.data.articles);
        }).then(() => {
            console.log('completed');
        }); 
    });
    res.redirect('/');
});

app.listen(3000, () => {
    console.log("app listening on port 3000");
});