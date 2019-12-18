var express = require('express');
    var bodyParser = require('body-parser');
    var Pusher = require('pusher');

    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // enable cross-origin resource sharing
   app.use(function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     next();
   });


   var pusher = new Pusher({ // connect to pusher
      appId: "918580",
      key: "f47550c0335c0d83863f",
      secret:  "836c4c3afd79a63f4803",
      cluster: "us3",
    });

    // app_id = "918580"
    // key = "f47550c0335c0d83863f"
    // secret = "836c4c3afd79a63f4803"
    // cluster = "us3"

// Next, add a route for checking if the server is running:

    app.get('/', function(req, res){ // to test if the server is running
      res.send('all green');
    });

// Lastly, add the routes for authenticating users. Later on, the Chat component will hit this route every time a visitor views a blog post:

    // to authenticate users
    app.post('/pusher/auth', function(req, res) {
      var socketId = req.body.socket_id;
      var channel = req.body.channel_name;
      var origin = req.get('origin');
    // if(origin == 'YOUR BLOG DOMAIN NAME OR IP'){
    //   // authenticate the request
    // }
      var auth = pusher.authenticate(socketId, channel);
      res.send(auth);
    });

    var port = process.env.PORT || 5000;
    app.listen(port);
