const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
app.use(bodyParser.text({ limit: '200mb' }));
app.use(bodyParser.json({ limit: '200mb' }));

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