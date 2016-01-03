'use strict';

var express = require('express');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var bodyParser = require('body-parser');
var multer = require('multer');
var md5 = require('md5');
var ECT = require('ect');
var glob = require('glob');

var db = require('./model');
//var db = require('./model-mongodb');
var Post = db.model('Post');
var app = express();

// static resources
app.use('/jquery',
  express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/bootstrap',
  express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');

// body parser
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

var avatar = require('./avatar')({
  order: 'background face clothes head hair eye mouth'.split(' '),
  images: 'montage/img',
  convertCommand: 'convert',
  imageDir: imageDir,
  cacheDir: cacheDir
});

app.get('/', function(req, res) {
  if (db.connection.readyState === 0) {
    res.render('error', { title: 'Connection Error' });
    return;
  }

  Post.find({}, function(err, items) {
    res.render('index', { title: 'Member List', items: items });
  });
});

var removeFiles = function(dir, pattern) {
  return function(id, callback) {
    glob(path.join(dir, id + pattern), function(err, files) {
      if (err) {
        console.log(err);
        callback(err);
        return;
      }
      files.forEach(function(file) {
        fs.unlinkSync(file);
      });
      callback();
    });
  };
};

var removeImage = removeFiles(imageDir, ".jpg");
var removeCache = removeFiles(cacheDir, "*.jpg");

app.get('/form', function(req, res) {
  res.render('form', { title: 'New Member' });
});
app.post('/create', function(req, res) {
  var name = req.body.name;
  var sex = req.body.sex;

  var id = md5(name);
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
    removeCache(id, function(err) {
      if (err) {
        res.redirect('back');
        return;
      }
    });
  }

  // insert or update
  Post.find({name: name}, function(err, items) {
    if (items.length == 0) {
      // insert
      var newPost = new Post({id: id, name: name, sex: sex});
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
      var newPost = new Post({id: id, sex: sex});
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
app.get('/delete/:id', function(req, res) {
  var id = req.params.id;
  Post.remove({id: id}, function() {
    // remove cache
    removeCache(id, function(err) {
      if (err) {
        res.redirect('back');
        return;
      }
      removeImage(id, function(err) {
        if (err) {
          res.redirect('back');
          return;
        }
        res.redirect('/');
      });
    });
  });
});

app.listen(process.env.PORT || 3000);
