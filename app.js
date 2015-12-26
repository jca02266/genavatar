'use strict';

var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

var avatarGenerator = require('avatar-generator')({
  order: 'background face clothes head hair eye mouth'.split(' '),
  images: path.join(__dirname, 'node_modules/avatar-generator/img'),
  convert: 'convert-image'
});

var avatar = new Promise(function(resolve) {
  avatarGenerator('test@example.com', 'male', 200)
  .write('./test.jpg', function (err) {
    if (err) {
      console.log(err);
    }
  });
  resolve();
});

app.get('/:id', function(req, res) {
  res.header("Content-Type", "image/jpeg");
  avatar.then(function() {
    fs.readFile('test.jpg', function (err,data) {
      if (err) {
        console.log(err);
        return;
      }
      res.send(data);
    });
  });
});

app.listen(3000);