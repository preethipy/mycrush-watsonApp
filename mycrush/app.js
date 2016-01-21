var express =   require("express");
var multer  =   require('multer');
var app         =   express();
bluemix = require('./config/bluemix'),
validator = require('validator'),
watson = require('watson-developer-cloud'),
extend = require('util')._extend,
fs = require('fs');
path = require('path');
request = require('request');

app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
//if bluemix credentials exists, then override local
var credentials = extend({
  version: 'v2-beta',
  username: '699b883d-39cf-477e-81ff-bba2ea1d34c7',
  password: 'yhGfmUGb3N6S',
  version_date:'2015-12-02'
}, bluemix.getServiceCreds('visual_recognition')); // VCAP_SERVICES



//Create the service wrapper
var visualRecognition = watson.visual_recognition(credentials);

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    //callback(null, file.fieldname + '-' + Date.now());
	callback(null, file.originalname);
  }
});
var upload = multer({ storage : storage}).single('pic');


app.get('/',function(req,res){
	  console.log("Path",__dirname + "/public/index.html");
      res.render('index.html');
});

var pictureName = ""
app.post('/',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        console.log("File is uploaded");
        console.log("Req", req.file.path);
        imgFile = fs.createReadStream(path.join('./uploads',req.file.originalname));
        pictureName = req.body.first_name

    var formData = {
      images_file: imgFile
    };
    var obj = {};
    visualRecognition.classify(formData, function(error, result) {
      if (error)
        return res.status(error.error ? error.error.code || 500 : 500).json({ error: error });
      else{
      	
      	//filterUserCreatedClassifier    	    
      	    console.log('testing' + JSON.stringify(result));
      	    
      	  //var a=JSON.stringify(result)
      	    
      	    /*for (var prop in result) {
      	        obj[prop] = result[prop];
      	        var abc = obj[prop]
      	        for (var subprop in abc) {
          	        obj[subprop] = abc[subprop];
          	        
          	        console.log(obj[subprop]);
          	    }
      	        //console.log(obj[prop]);
      	    }*/
      	    
      	    var image = result.images[0];
      	    var scores = image.scores;
      	    
      	    var male_adult = 0;
      	    var female_adult = 0;
      	    var complexion = 0;
      	    var person = 0;
      	    
      	    
      	  var response1 = new Object();
      	  for (i = 0, len = scores.length; i < len; i++) {
      		  
      		var maxClass = scores[i].classifier_id;
      		var percentage = scores[i].score * 100
      		var maxScore = percentage.toFixed(2);
      		
      		console.log("*****",maxClass)
      		
      		if(maxClass.indexOf("Person") > -1){
      			console.log("Good photo!!!")
      			response1.photoquality = maxScore;
      		
      		}
      		if(maxClass.indexOf("Adult") > -1){
      			response1.adult = maxScore;
      		
      		}
      		
      		if(maxClass.indexOf("male") > -1){
      			response1.male = maxScore;
      		
      		}
      		if(maxClass.indexOf("female") > -1){
      			response1.female = maxScore;
      		
      		}
      		if(maxClass.indexOf("Brown") > -1){
      			response1.brown = maxScore;
      		
      		}
      		if(maxClass.indexOf("Baby") > -1){
      			response1.baby = maxScore;
      		
      		}
      		
      		response1.maxClass = maxClass;
      		response1.maxScore = maxScore;
      		
      		        	    
      	  }
      	  response1.requestname = pictureName;
      	  
      	  console.log(response1)
      	    
      	    /*var maxClass = result.images[0].scores[0].classifier_id;
      	    var maxScore = result.images[0].scores[0].score;
      	    
      	  response1.maxScore = maxScore;
      	  response1.maxClass = maxClass;*/
      	  res.json(response1);
      	  // the below code shows everything
      	  //res.json(scores);
      }
        
    });
});
    
});

app.listen(3000,function(){
    console.log("Working on port 3000");
});