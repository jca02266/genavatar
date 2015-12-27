'use strict';

var express = require('express');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var model = require('./model');
var md5 = require('md5');
var Post = model.Post;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(multer({ dest: './uploads/'}).single('image'));
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var imageDir = 'image';
mkdirp(imageDir, function (err) {
  // path is already exists
});

var avatarGenerator = require('avatar-generator')({
  order: 'background face clothes head hair eye mouth'.split(' '),
  images: path.join(__dirname, 'node_modules/avatar-generator/img'),
  convert: 'convert'
});

var avatar = function (id, size, sex) {
  size = size || 80;
  sex = sex || 'male';
  return new Promise(function(resolve) {
    var filename = path.join(imageDir, id + '-' + size + '.jpg');

    if (fs.existsSync(filename)) {
      resolve(filename);
      return;
    }

    avatarGenerator(id, sex, size)
    .write(filename, function (err) {
      if (err) {
        console.log(err);
        return;
      }
      resolve(filename);
    });
  });
}

app.get('/', function(req, res) {
  Post.find({}, function(err, items) {
    res.render('index', { title: 'Member list', items: items });
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
  }

  var newPost = new Post({email: email, id: id, path: dstpath});
  newPost.save(function(err) {
    if (err) {
      console.log(err);
      res.redirect('back');
      return;
    }
    res.redirect('/');
  });
});
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
