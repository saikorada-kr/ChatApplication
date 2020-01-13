const mongo = require('mongodb').MongoClient;

const client = require('socket.io').listen(4000).sockets;


var MongoClient = require('mongodb').MongoClient;

// var uri = "mongodb://mongochat123:mongochat123@mongochat-shard-00-00-ttszt.mongodb.net:27017,mongochat-shard-00-01-ttszt.mongodb.net:27017,mongochat-shard-00-02-ttszt.mongodb.net:27017/test?ssl=true&replicaSet=mongochat-shard-0&authSource=admin&retryWrites=true&w=majority";
// MongoClient.connect(uri, function(err, client) {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

//connect to mongo

mongo.connect('mongodb://127.0.0.1/mongochat',{ useUnifiedTopology: true },function (err,db){
    if (err){
        throw err;
    }

    
    console.log('mongodb connected...')

    //connect to socket.io

    client.on('connection',function(socket){
        let chat = db.collection('chats');
        //create function to send status

        sendStatus = function(s){
            socket.emit('status',s);
        
        }
        //get chat from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
            if (err){
                throw err;
            }
            //emit the message
            socket.emit('output',res);
        });
           
        //handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            //check for name and message
            if (name == ''|| message == ''){
                //send status
                sendStatus('please enter name and message')
            }else {
                //insert message
                chat.insert({name: name, message: message}, function(){
                    client.emit('output',[data]);

                    //send status
                    sendStatus({
                        message:'Message sent',
                        clear: true
                    });
                });
            }
        });

       //handle clear
       socket.on('clear', function(data){
           //remove all chats from collection
           chat.remove({},function(){
               socket.emit('cleared');
           });
       });

    });
});