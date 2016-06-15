//npm init --y
//anything with 000 if front of it is your local host. Local host is 27017
//sudo mongod
//delete node mode during test
//npm install express --save
//npm install body-parser --save
//npm install ejs --save
//npm install mongoose --save
//nodemon server.js
// people pay for finished features; tackle problems one by one instad of many

//////////ser up our app//////////
// we need to use express to make our lives easy :) ////
var express = require('express');
// use express to make an app that will make our lives easier
var app = express();
// ; are optional but use them for habit. You dont need them in js. JS lint and js hint
// add other dependencies
//body parser to extract informaton out of a form
var bodyParser = require('body-parser');
// multiple comps can get to your directory names w/o issues
// theyre all unique
var path = require('path');
// if you console.log __dirname to see where the path is

//////// AP Configure /////////
// sets up each fule we render to have the /ejs extention (embedded JS files)
app.set('view engine', 'ejs');
// where are our views at? in a folder called client
app.set('views', path.join(__dirname, '/client/views'))
//set up some static content for the user/
// anything within the static folder will auto give to the user
app.use(express.static(__dirname + '/client/static'))
// anything with __ are special names, 'magic mathods'
// use body parser to extract indo out of our forms
app.use(bodyParser.urlencoded({extended:true}));
////////models///////
// configure and set up mongoose ///
var mongoose = require('mongoose');
// connect to our mongodb //
mongoose.connect('mongodb://localhost/my_messageBoard')
// set up our schemas
var MessageSchema = mongoose.Schema({
  name: {type: String, required: true, min: 2},
  // require them to put a name with a minimun of 2 char
  message: { type: String, requred: true, min: 2, max: 255},
  _comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
  }, { timestamps: true});
  //make an array to habe multiple object
  // _ comments underscored for convention, it's referening a foriegn key and object
  // mongoose schema has a key called types, called object id
  // we regiser our schema
mongoose.model('Message', MessageSchema);

var CommentSchema =  mongoose.Schema({
  name: {type: String, required: true, min: 2},
  comment: { type: String, requred: true, min: 2, max: 255},
  _message: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}]
  // comment belongs to one message
}, { timestamps: true});
mongoose.model('Comment', CommentSchema);
//////// retrieve those models////////
var Message = mongoose.model('Message');
///// name is Message and Comment////
var Comment = mongoose.model('Comment');
//////////// Routes/Controller Logic ///////////
app.get('/', function(req, res){
  console.log('in root route!');
  // console's in terminal
  // every time you refresh the page, itll post console in terminal
  Message.find({}).populate('_comments').exec(function(err, messages){
    // if error we throw them at the user
    if(err){
      res.json(err)
    }else{
      // else we want to display them on the page
      console.log(messages[0]._comments[0]);
      // we pass our messages to the view
      res.render('index', {messages: messages});
      // render index
    }
  })
});
app.post('/create_message', function(req, res){
  // take in a req w the form fulled out
  // post requres encaps goes through the
  console.log('message recieved', req.body);
  //put put info in the bluerpint of what a message should be
  var message = new Message(req.body);
  // save that message at this point
  // console.log(message);

  message.save(function(err){
  // save in database
    if(err){
      // if ther eis an error we render json informaton
      res.json(err);
    }else{
      res.redirect('/');
    }
  })
});
app.post('/create_comment/:message_id', function(req,res){
  console.log(req.params)
  // saving an associated record
  //step 1
  // lets find the messaged based on the info in our url
  // params; parameter of the url; itll send back to our db
  //message_id is for the all across id instead of each different id
  Message.findOne({__id: req.params.message_id}, function(err, message){
  //find one message to ulter one message; There's a difference
  if(err){
    res.json(err);
  }else{
    // step 2
    // create the instance of the new comment
    // console.log(message)
    var new_comment = new Comment(req.body)
    // step 3
    // attach the message id to the comment
    // attach the parent obj to the comment
    new_comment._message = message._id
    // step 4
    // save the new comment
    new_comment.save(function(err){
      if(err){
        res.json(err)
      }else{
        // step 5
        // update the message w the comment id
        message._comments.push(new_comment._id)
        // this is an array, we need to push something into it
        // our parent obj of comments, pushing a new comment to the new comment
        // step 6
        // save the updated message
        message.save(function(err){
          if(err){
            // if ther is an error
            res.json(err)
          }else{
            ///// step 7
            //// if not, Get the hell out of here
            res.redirect('/')
            // back to index is the best place to go.
          }
        })
      }
    })
  }
  // find with return array
  })
});
// cannot post after submit button, so create a post/
///// /////////// Start Server ////////////////////
app.listen(4444, function(){
  console.log('*****4444*****')
  /// console.log to see if its working
  // consoles server when it restarts
});
