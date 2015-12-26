'use strict';

var express = require('express');
var fs = require('fs');

var app = express();

app.get('/:id', function(req, res) {
  res.header("Content-Type", "image/jpeg");
  fs.readFile('test.jpg', function (err,data) {
    res.send(data);
  });
});

app.listen(3000);
