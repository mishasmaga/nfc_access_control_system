const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require("./config/db");
const app            = express();

// server.js
const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));
//require('./routes')(app, {});


// app.listen(port, () => {
//   console.log('We are live on ' + port);
// });


MongoClient.connect(db.url, (err, database) => {
    if (err) return console.log(err);

    require('./routes')(app, database);

    app.listen(port, () => {
      console.log('We are live on ' + port);
    });               
  })