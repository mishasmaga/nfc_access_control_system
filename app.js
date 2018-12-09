const MongoClient = require("mongodb").MongoClient;
const db = require("./config/db");

const mongoClient = new MongoClient(db.url, { useNewUrlParser: true });

mongoClient.connect(async function (err, client) {

    const dbo = client.db("testdb1");
    var userCollection = dbo.collection("users");
    var keysCollection = dbo.collection("keys");
    var historyCollection = dbo.collection("history");


    //prepare data 
    var keys = [{ tag_id: "8B61F4FC", name: "k1" }, { tag_id: "971DDB26", name: "k2" }, { tag_id: "0BAED2CB", name: "k3" }];

    var ks = (await keysCollection.insertMany(keys)).ops;
    // keysCollection.save();

    var users = [{
        tag_id: "04D93E99", iscontroller: false, name: "u1", PermissionForKeys: [ks[0]._id, ks[1]._id, ks[2]._id]
    },
    { tag_id: "64B24499", iscontroller: false, name: "u2", PermissionForKeys: [ks[0]._id, ks[1]._id] },
    { tag_id: "81198E1B", iscontroller: true, name: "c1", PermissionForKeys: [] }
    ]


    // var r = await userCollection.insertOne(users[0]);

    // var r1 = await userCollection.updateOne({_id:r.insertedId},{ $push: { PermissionForKeys: ks[0]._id } }) ;

    var us = await userCollection.insertMany(users);

    console.log(us);
    console.log(ks);
    // var user = await userCollection.findOne();
    // var key = await keysCollection.findOne();

    // var isApproved = containsKey(user.PermissionForKeys, key._id);

    // console.log(isApproved);
});

