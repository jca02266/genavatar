'use strict';

var express = require('express');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var md5 = require('md5');
var ECT = require('ect');
var exec = require('child_process').exec;
var md5 = require('md5');
var glob = require('glob');

var db = require('./model');
var Post = db.model('Post');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');
app.use(multer({ dest: './uploads/'}).single('image'));
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.get('/', function(req, res) {
  if (db.connection.readyState === 0) {
    res.render('error', { title: 'Connection Error' });
    return;
  }

  Post.find({}, function(err, items) {
    res.render('index', { title: 'Member List', items: items });
  });
});
app.get('/form', function(req, res) {
  res.render('form', { title: 'New Member' });
});
app.post('/create', function(req, res) {
  var email = req.body.email;

  var id = md5(email);
  if (req.file) {
    var file = req.file;
    var srcpath = file.path
    var dstpath = path.join(imageDir, id + '.jpg');
    console.log(file);
    console.log(srcpath);
    console.log(dstpath);

    fs.rename(srcpath, dstpath, function(err) {
      if (err) {
        console.log(err);
        res.redirect('back');
        return;
      }
    });
    // remove cache
    glob(path.join("cache", id + "-*.jpg"), function(err, files) {
      if (err) {
        console.log(err);
        res.redirect('back');
        return;
      }
      files.forEach(function(file) {
        fs.unlinkSync(file);
      });
    });
  }

  // insert or update
  Post.find({email: email}, function(err, items) {
    if (items.length == 0) {
      // insert
      var newPost = new Post({id: id, email: email});
      newPost.save(function(err) {
        if (err) {
          console.log(err);
          res.redirect('back');
          return;
        }
      });
    }

    res.redirect('/');
  });
});

app.get('/avatar/:id', function(req, res) {
  var id = req.params.id;
  var size = req.query.s || req.query.size;
  var sex = req.query.x  || req.query.sex;

  Post.find({id: id}, function(err, items) {
    if (items.length == 0) {
      // no entry
      var newPost = new Post({id: id});
      newPost.save(function(err) {
        if (err) {
          console.log(err);
          return;
        }
      });
    }
  });

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

app.listen(process.env.PORT || 3000);
