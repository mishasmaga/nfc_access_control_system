var ObjectID = require('mongodb').ObjectID;
var responseMessages = require('./messages_const');

module.exports = function (app, db) {
  app.get('/check_tag/:id', async (req, res) => {

    const id = req.params.id;

    var dbo = db.db("testdb1");
    var userCollection = dbo.collection("users");
    var keysCollection = dbo.collection("keys");
    var historyCollection = dbo.collection("history");

    //res.send("@"+responseMessages.tag_not_found+"@");

    //check tag is user     
    var user = await userCollection.find({ tagid: id });
    if (user != null) {
      if (user.isController) {

        var historyRecord = await historyCollection.findOne({ intransaction: true });
        if (historyRecord == null) {
          //error
          res.send(convertToArduinoMessage(responseMessages.error));
        }
        else {
          //first part
          if (historyRecord.controller1 == null) {
            if (historyRecord.keys1.length == 0) {
              //error
              res.send(convertToArduinoMessage(responseMessages.any_key));
            } else {
              //sign history record
              historyRecord.date_start = DateTime.Now();
              historyRecord.controller1 = new DBRef('users', user._id);
              historyRecord.intransaction = false;

              historyCollection.save(historyRecord);

              res.send(convertToArduinoMessage(responseMessages.done));
            }
          }
          else {
            //check key1 to key2 collections
            var isEqual = keysArrayIsEqual(historyRecord.keys1, historyRecord.keys2);

            if (isEqual) {
              //sign and close trans
              historyRecord.date_end = DateTime.Now();
              historyRecord.controller2 = new DBRef('users', user._id);
              historyRecord.intransaction = false;

              historyCollection.save(historyRecord);

              res.send(convertToArduinoMessage(responseMessages.done));

            } else {
              //show error
              res.send(convertToArduinoMessage(responseMessages.not_all_keys))
            }
          }
        }
      }

      else {
        //check history for not closed transaction (keys not on user)           
        var h = await historyCollection.findOne({ userid: user._id, controller1: { $ne: null } });
        if (h != null) {
          //set flag in transaction on existing history record
          await historyCollection.updateOne({ _id: h._id }, { $set: { intransaction: true } });
        }
        else {
          //create new history record and set flag on transaction
          var h = await historyCollection.save({ user_id: new DBRef('users', user._id), intransaction: true });
          res.send(convertToArduinoMessage(responseMessages.insert_key_tag));
        }
      }
    }
    else {
      //check tag is key
      var key = await keysCollection.find({ tagid: id });
      if (key != null) {
        //get history record 
        var history = await historyCollection.findOne({ intransaction: true });

        if (history == null) {
          res.send(convertToArduinoMessage(responseMessages.set_user_firstly));
        } else {

          if (history.controller2 == null) {
            //get user by history
            var user = await db.dereference(history.user_id);

            //TODO check permissions 
            var isApproved = user.PermissionForKeys.includes(key._id);
            if (isApproved) {
              //add to history
              await historyCollection.updateOne({ _id: history._id }, { $push: { key1: new DBRef("keys", key._id) } });
              //show message
              res.send(convertToArduinoMessage(responseMessages.key_approved));
            } else {
              //show message
              res.send(convertToArduinoMessage(responseMessages.key_not_approved));
            }
          }
          else {
            //user give keys
            //insert in history
            await historyCollection.updateOne({_id: history._id}, {$push:{key2:new DBRef("keys", key._id)}});
            //show result
            res.send(convertToArduinoMessage(responseMessages.next_tag));
          }
        }
      } else {
        //tag not found
        res.send(convertToArduinoMessage(responseMessages.tag_not_found));
      }
    }
  });
};

function convertToArduinoMessage(m) {
  return "@" + m + "@";
}

function keysArrayIsEqual( array1, array2){
  for(var i = 0; i< array2.length;i++){
    if(!array1.includes(array2[i])) return false; 
  }
  return true;
}