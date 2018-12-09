var ObjectID = require('mongodb').ObjectID;
var responseMessages = require('./messages_const');

module.exports = function (app, db) {
  app.get('/check_tag/:id', async (req, res) => {

    const id = req.params.id;

    var dbo = db.db("testdb1");
    var userCollection = dbo.collection("users");
    var keysCollection = dbo.collection("keys");
    var historyCollection = dbo.collection("history");

    //check tag is user     
    var user = await userCollection.findOne({ tag_id: id });
    if (user != null) {
      if (user.iscontroller) {

        var historyRecord = await historyCollection.findOne({ intransaction: true });
        if (historyRecord == null) {
          //error
          res.send(convertToArduinoMessage(responseMessages.error));
        }
        else {
          //first part
          if (historyRecord.controller1 == null) {
            if (historyRecord.keys1 == null || historyRecord.keys1.length == 0) {
              //error
              res.send(convertToArduinoMessage(responseMessages.any_key));
            } else {
              //sign history record
              var date = (new Date()).toLocaleString();
              await historyCollection.updateOne({ _id: historyRecord._id }, { $set: { date_start: date, controller1: user._id, intransaction: false } }
              );

              res.send(convertToArduinoMessage(responseMessages.done));
            }
          }
          else {
            //check key1 to key2 collections
            var isEqual = keysArrayIsEqual(historyRecord.keys1, historyRecord.keys2);

            if ((historyRecord.keys2 != undefined && historyRecord.keys2 != null)
              || keysArrayIsEqual(historyRecord.keys1, historyRecord.keys2)) {
              //sign and close trans
              var date = (new Date()).toLocaleString();
              await historyCollection.updateOne({ _id: historyRecord._id }, { $set: { date_end: date, controller2: user._id, intransaction: false } });

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
        var h = await historyCollection.findOne({ user_id: user._id, controller2: { $eq: null } });
        if (h != null) {
          //set flag in transaction on existing history record
          await historyCollection.updateOne({ _id: h._id }, { $set: { intransaction: true } });
        }
        else {
          //create new history record and set flag on transaction
          await historyCollection.insertOne({ intransaction: true, user_id: user._id });
        }
        res.send(convertToArduinoMessage(responseMessages.insert_key_tag));
      }
    }
    else {
      //check tag is key
      var key = await keysCollection.findOne({ tag_id: id });
      if (key != null) {
        //get history record 
        var history = await historyCollection.findOne({ intransaction: true });

        if (history == null) {
          res.send(convertToArduinoMessage(responseMessages.set_user_firstly));
        } else {

          if (history.controller1 == null) {
            //get user by history
            var user = await userCollection.findOne({ _id: history.user_id });

            var isApproved = containsKey(user.PermissionForKeys, key._id);
            if (isApproved) {
              //add to history
              await historyCollection.updateOne({ _id: history._id }, { $push: { keys1: key._id } });
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
            await historyCollection.updateOne({ _id: history._id }, { $push: { keys2: key._id } });
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

function keysArrayIsEqual(array1, array2) {
  for (var i = 0; i < array2.length; i++) {
    if (!containsKey(array1, array2[i])) return false;
  }
  return true;
}

function containsKey(array1, key) {
  for (var i = 0; i < array1.length; i++) {
    if (array1[i].equals(key)) return true;
  }
  return false;
}