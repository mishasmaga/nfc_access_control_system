const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const app            = express();

// server.js
const port = 8000;
app.listen(port, () => {
  console.log('We are live on ' + port);
});


// // создаем объект MongoClient и передаем ему строку подключения
// const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });
// mongoClient.connect(function(err, client){
 
//     if(err){
//         return console.log(err);
//     }
//     // взаимодействие с базой данных
//     client.close();
// });