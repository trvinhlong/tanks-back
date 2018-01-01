var express = require('express');
var router = express.Router();
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var FB = require('fb');
var fb = new FB.Facebook();
var request = require('request');
var fs = require('file-system');
var appConfig = require('../appConfig');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

passport.use(new Strategy(appConfig,
  function(accessToken, refreshToken, profile, cb) {
    FB.setAccessToken(accessToken);
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

function getPhotos() {
    FB.options({
        client_id: appConfig.clientID,
        client_secret: appConfig.clientSecret
    })
    FB.api('913563252113498/photos', { fields: 'images,name', limit: 50 }, function (res) {
        if(!res || res.error) {
            console.log(!res ? 'error occurred' : res.error)
            return;
        }
        // remove all existing files
        fs.readdir('./public/images', function(err, items) {
            items.forEach((img, index) => {
              fs.unlink('./public/images/' + index + '.jpg', () => {console.log('deleted ' + index)});
            });
        });
        
        // download new files
        res['data'].forEach((img, index) => {
            download(img['images'][0]['source'], './public/images/' + index + '.jpg', () => {console.log('downloaded ' + index)});
        });
    })
}

// Define routes.
router.get('/',
  function(req, res) {
    getPhotos();
    res.render('home');
  });

router.get('/login',
  passport.authenticate('facebook', { scope: ['manage_pages'] }));

router.get('/return', 
  passport.authenticate('facebook', { failureRedirect: '/facebook' }),
  function(req, res) {
    res.redirect('/facebook');
  });

module.exports = router;