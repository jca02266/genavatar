'use strict';

var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

var imageDir = 'image';
fs.mkdirSync(imageDir);
var avatarGenerator = require('avatar-generator')({
  order: 'background face clothes head hair eye mouth'.split(' '),
  images: path.join(__dirname, 'node_modules/avatar-generator/img'),
  convert: 'convert-image'
});

var avatar = function (id) {
  return new Promise(function(resolve) {
    var size = 200;
    var filename = path.join(imageDir, id + '-' + size + '.jpg');

    if (fs.existsSync(filename)) {
      resolve(filename);
      return;
    }

    avatarGenerator(id, 'male', size)
    .write(filename, function (err) {
      if (err) {
        console.log(err);
        return;
      }
      resolve(filename);
    });
  });
}

app.get('/:id', function(req, res) {
  res.header("Content-Type", "image/jpeg");
  avatar(req.params.id).then(function(filename) {
    fs.readFile(filename, function (err,data) {
      if (err) {
        console.log(err);
        return;
      }
      res.send(data);
    });
  });
});

app.listen(3000);
