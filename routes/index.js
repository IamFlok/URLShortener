var express = require('express');
var mongo = require('mongodb').MongoClient;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/*GET new API function. */
var url = '/new/:urlToShorten(*)';

router.get(url, (req, res, next) => {
  var { urlToShorten } = req.params;

  // use regex for validating url
  var regex = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
  if(regex.test(urlToShorten)) {
     // main shorturl generator
     generateShort();
  } else {
    // show the invalid url but don't save it into the database
    var data = {
      originalUrl: urlToShorten,
      shortUrl: 'InvalidURL'
    };
    return res.json(data);
  }

  // responsible to generating a valid shorturl
  function generateShort() {
    // generate a new random number and check if it exists in the database
    var random = Math.floor(Math.random()*100000).toString();
    isNewShort(random, () => {
      // if it is a new shorturl, create the data
      createData(random);
    });
  }

  // this function creates the data, call update and display it
  function createData(short) {
    var data = {
        originalUrl: urlToShorten,
        shortUrl: short,
        dateAdded: new Date()
    };
    updateToDatabase(data);
    return res.json(data);
  }
});

// helper function used to check if the generated number is in the database
function isNewShort(random, callback) {
  mongo.connect(process.env.MONGODB_URI ||
    'mongodb://fccuser:fCcUsER61@ds131384.mlab.com:31384/freecodecamp',
    (err, db) => {
     if (err) throw err;
     var shorturls = db.collection('shorturls');

     shorturls.find({shortUrl: random}, {_id: 1}).toArray((err, doc) => {
       if (err) throw err;
       // speedup hasOwnProperty call
       var hasOwnProperty = Object.prototype.hasOwnProperty;

       if (isEmpty(doc)) {
         // this is a new number
         callback();
       } else {
         // the number exists, restart the process and generate new shorturl
         generateShort();
       }
       db.close();
    });
   });
};

// helper function, checks whether an object has valid property
function isEmpty(obj) {
  if (obj == null) return true;
  if (obj.length > 0) return false;
  if (obj.length === 0) return true;
  if (typeof obj !== "object") return true;
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  };
  return true;
};

// update the new data to database
function updateToDatabase(obj) {
  mongo.connect(process.env.MONGODB_URI ||
    'mongodb://fccuser:fCcUsER61@ds131384.mlab.com:31384/freecodecamp',
    (err, db) => {
     if (err) throw err;
     var col = db.collection('shorturls');

     col.insert(obj, (err, data) => {
         if (err) throw err;
         db.close();
     });
  });
};

// TODO GET shorturl API function
var url2 = '/:urlToRedirect(*)';

router.get(url2, (req, res, next) => {
  var shortUrl = req.params.urlToRedirect;

  mongo.connect(process.env.MONGODB_URI ||
    'mongodb://fccuser:fCcUsER61@ds131384.mlab.com:31384/freecodecamp',
    (err, db) => {
     if (err) throw err;
     var col = db.collection('shorturls');

     col.findOne({'shortUrl': shortUrl}, (err, data) => {
       if (err) throw err;
       var regex = new RegExp("^(http|https)://", "i");
       var strToCheck = data.originalUrl;
       if (regex.test(strToCheck)) {
         res.redirect(301, data.originalUrl);
       } else {
         res.redirect(301, 'http://' + data.originalUrl);
       }
     });
   });
});

module.exports = router;
