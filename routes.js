var ObjectID = require('mongodb').ObjectID;
var responseMessages = require('./messages_const');

module.exports = function(app, db) {
    app.get('/check_tag/:id', async (req, res) => {
      
      const id = req.params.id;

      var dbo = db.db("testdb1");
      var userCollection  = dbo.collection("users");
      var keysCollection = dbo.collection("keys");
      var poolCollection = dbo.collection("pool");
      var historyCollection = dbo.collection("history");

     // console.log(req);
     // console.log(params);
      console.log(id);

      //var user = await userCollection.find().toArray();

      res.send("@"+responseMessages.tag_not_found+"@");
      
      // //check tag is user     
      // var user = await userCollection.find({tagid:id});
      // if(user!=null){
      //   if(user.isController){
      //     //get last pool 
      //     var poolRecords = await poolCollection.find().toArray();

      //     if(poolRecords.length = 0 ){
      //       //error -> close con
      //       res.send({mess:responseMessages.error});
      //     }
      //     else{
      //       var firstPoolRecord = poolRecords[0];
      //     //check history
          

      //     }
          

      //   }else{
      //     //check pool and add
           
          
      //   }
      // }
      // else{
      //   //check tag is key
      //   var key = await keysCollection.find({tagid:id});
      //   if(key!=null){
      //     //check pool and add to pool

      //   }else{
      //     //tag not found
      //     res.send({mess:responseMessages.tag_not_found});
      //   }
      // }  
      
      
    });
  };