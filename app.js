const MongoClient = require("mongodb").MongoClient;
   
const url = "mongodb://admin2:admin2ps@ds127604.mlab.com:27604/testdb1";
const mongoClient = new MongoClient(url, { useNewUrlParser: true });
 

//mongoClient.connect()
//mongoClient.collection

mongoClient.connect(async function(err, client){
      
    const db = client.db("testdb1");
    const collection = db.collection("users");

    try{
      var  r = await  collection.find().toArray();
        console.log(r);
    }catch(e){
        console.log(e);
    }
    // let user = {name: "Tom", age: 23};
    // collection.insertOne(user, function(err, result){
          
    //     if(err){ 
    //         return console.log(err);
    //     }
    //     console.log(result.ops);
    //     client.close();
    // });
});

// MongoClient.connect(url, function(err, db){
//     if(err) console.log(err);

//     var dbo = db.db("testdb1");


// })