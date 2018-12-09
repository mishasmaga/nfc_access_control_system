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
     
      //res.send("@"+responseMessages.tag_not_found+"@");
      
       //check tag is user     
      var user = await userCollection.find({tagid:id});
      if(user!=null){
        if(user.isController){
         
            var historyRecord = await historyCollection.findOne({intransaction:true});
            if(historyRecord==null){
              //error
              res.send(convertToArduinoMessage(responseMessages.error));
            }
            else{
                //first part
                if(historyRecord.controller1==null ){
                  if(historyRecord.keys1.length==0){
                    //error
                    res.send(convertToArduinoMessage(responseMessages.any_key));
                  }else{
                    //sign history record
                    historyRecord.date_start = DateTime.Now();
                    historyRecord.controller1 = new DBRef('users', user._id);
                    historyRecord.intransaction = false;
                   
                    historyCollection.save(historyRecord);

                    res.send(convertToArduinoMessage(responseMessages.done));
                  }
                }
                else{
                  //check key1 to key2 collections
                  var isEqual = true;

                  if(isEqual){
                    //sign and close trans
                    historyRecord.date_end = DateTime.Now();
                    historyRecord.controller2 = new DBRef('users', user._id);
                    historyRecord.intransaction = false;

                    historyCollection.save(historyRecord);

                    res.send(convertToArduinoMessage(responseMessages.done));

                  }else{
                    //show error
                    res.send(convertToArduinoMessage(responseMessages.not_all_keys))
                  }
                }
            }
          }
        
        else{
          //check history for not closed transaction (keys not on user)           
          //var h = await historyCollection.findOne({userid: user._id, controller1:{$e:null}});
          // if(h!=null){

          // }

          //create new history record
          var h = await historyCollection.save({user_id:new DBRef('users',user._id)});
          res.send(convertToArduinoMessage(responseMessages.insert_key_tag));
        }
      }
      else{
        //check tag is key
        var key = await keysCollection.find({tagid:id});
        if(key!=null){
          //add to history
          
          //1 get history without 1 controller

          var history = await historyCollection.findOne({controller1:null});
          if(history == null){
            res.send(convertToArduinoMessage(responseMessages.error));
          }else{
            //2 check user permissions
            //3 set key to this history and send approved
            //3.1 send not approved   
            
            var user = await userCollection.findOne({'_id':})
          } 
        }else{
          //tag not found
          res.send(convertToArduinoMessage(responseMessages.tag_not_found));
        }
      }            
    });
  };

  function convertToArduinoMessage(m){
      return "@"+m+"@";
  }