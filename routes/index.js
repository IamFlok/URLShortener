var express = require('express');
const mongoose = require('mongoose');
const shortUrl = require('../models/shortUrl');
var router = express.Router();

//connect to database
mongoose.connect(process.env.MONGODB_URI ||
  'mongodb://fccuser:fCcUsER61@ds131384.mlab.com:31384/freecodecamp');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/*GET API function. */
var url = '/new/:urlToShorten(*)';

router.get(url, (req, res, next) => {
  var { urlToShorten } = req.params;
  // use regex for validating url
  var regex = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
  if(regex.test(urlToShorten)) {
    // generate a random 4 digit number and save it as short url
    var short = Math.floor(Math.random()*100000).toString();
    var data = new shortUrl({
        originalUrl: urlToShorten,
        shortUrl: short
    });

    data.save();
    return res.json(data);
  } else {
    // show invalid url but don't save it to the database
    var data = new shortUrl({
      originalUrl: urlToShorten,
      shortUrl: 'InvalidURL'
    });

    return res.json(data);
  }
});

// TODO Query database


module.exports = router;
