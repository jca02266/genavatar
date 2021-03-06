var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var objs = {};
var models = {};
var db = {
  connection: {
    readyState: 1
  },
  model: function(name, obj) {
    if (obj !== undefined) {
      models[name] = obj
    }
    return models[name];
  }
};

function Members(obj) {
  this.id = obj.id;
  this.name = obj.name;
  this.sex = obj.sex;
  this.created = obj.created || new Date;
}

Members.save = Members.prototype.save = function(callback) {
  objs[this.id] = this;
  if (callback) {
    callback();
  }
};

Members.find = Members.prototype.find = function(search, callback) {
  var items = []
  if (_.isEmpty(search)) {
    _.forEach(objs, function(obj) {
      items.push(obj)}
    );
    callback(undefined, items);
    return;
  }
  _.forEach(objs, function(obj) {
    _.forEach(search, function(val, key) {
      if (obj[key] === val) {
        items.push(obj);
      }
    });
  });
  callback(undefined, items);
};

Members.remove = Members.prototype.remove = function(search, callback) {
  if (_.isEmpty(search)) {
    objs = {};
    callback(undefined);
    return;
  }

  var items = []
  _.forEach(objs, function(obj) {
    _.forEach(search, function(val, key) {
      if (obj[key] === val) {
        items.push(obj);
      }
    });
  });
  items.forEach(function(obj) {
    delete objs[obj.id];
  });
  callback(undefined, items);
};

db.model('Members', Members);

fs.readdir('image', function(err, files) {
  if (err) {
    // image directory does not exist
    return;
  }
  files.forEach(function(file) {
    var m = /^(.*)\.jpg$/.exec(file);
    if (m) {
      var stat = fs.statSync(path.join('image', file));
      new Members({id: m[1], created: stat.mtime}).save();
    }
  });
});

module.exports = db;
