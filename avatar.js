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
        var command = [convertCommand,
                       "jpeg:" + filename,
                       '-resize', size,
                       cachename];
        exec(command.join(' '), callback);
        return;
      }

      // generate randomized image file
      avatarGenerator(id, sex, size).write(cachename, callback);
    });
  };
};

module.exports = avatar;
