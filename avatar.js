'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var md5 = require('md5');

var avatar = function(options) {
  var convertCommand = options.convertCommand || 'convert';
  var imageDir = options.imageDir;
  var cacheDir = options.cacheDir;
  var avatarGenerator = require('avatar-generator')({
    order: options.order || 'background face clothes head hair eye mouth'.split(' '),
    images: options.images || 'montage/img',
    convert: convertCommand
  });

  var resizeImage = function(srcPath, destPath, size, callback) {
    var command = [convertCommand,
                   "jpeg:" + srcPath,
                   '-resize', size,
                   destPath];
    exec(command.join(' '), callback);
  };

  return function(id, size, sex) {
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

      var callback = function(err) {
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
        resizeImage(filename, cachename, size, callback);
        return;
      }

      // generate randomized image file
      var original_size = 400;
      avatarGenerator(id, sex, original_size).write(filename, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        resizeImage(filename, cachename, size, callback);
      });
    });
  };
};

module.exports = avatar;
