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
    console.log("404");
   // next();
  //  res.redirect('/');
    res.sendStatus(404).send();
  });


app.listen(process.env.PORT || 3000);