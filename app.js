'use strict';

var express = require('express');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var exec = require('child_process').exec;
var md5 = require('md5');

var app = express();

// make directories
var cacheDir = 'cache';
var imageDir = 'image';
[cacheDir, imageDir].forEach(function(d) {
  mkdirp(d, function (err) {
    // path is already exists
  });
});

var convert_cmd = 'convert';
var avatarGenerator = require('avatar-generator')({
  order: 'background face clothes head hair eye mouth'.split(' '),
  images: 'montage/img',
  convert: convert_cmd
});

var avatar = function (id, size, sex) {
  return new Promise(function(resolve) {
    // Sanitize
    if (/[^0-9a-zA-Z.]/.test(id)) {
      id = md5(id);
    }
    if (! /^\d{1,3}/.test(size)) {
      size = 80;
    }
    if (sex !== 'male' && sex !== 'female') {
      sex = 'male';
    }

    var filename = path.join(imageDir, id + '.jpg');
    var cachename = path.join(cacheDir, id + '-' + size + '.jpg');

    var callback = function (err) {
      if (err) {
        console.log(err);
        return;
      }
      resolve(cachename);
    };

    if (fs.existsSync(cachename)) {
      // use cached image file
      resolve(cachename);
      return;
    }

    if (fs.existsSync(filename)) {
      // use the managed image file as source image
      var command = [convert_cmd,
                     "jpeg:" + filename,
                     '-resize', size,
                     cachename];
      exec(command.join(' '), callback);
      return;
    }

    // generate randomized image file
    avatarGenerator(id, sex, size).write(cachename, callback);
  });
}

app.get('/avatar/:id', function(req, res) {
  var id = req.params.id;
  var size = req.query.s || req.query.size;
  var sex = req.query.x  || req.query.sex;

  res.header("Content-Type", "image/jpeg");
  avatar(id, size, sex).then(function(filename) {
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
