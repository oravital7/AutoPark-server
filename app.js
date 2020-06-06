const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'public')));


const parksRouth = require('./routes/parks');

app.use(parksRouth);

  app.use((req, res, next) => {
    console.log("Hi i");
    next();
    // res.redirect('/');
  });


app.listen(process.env.PORT || 3000);