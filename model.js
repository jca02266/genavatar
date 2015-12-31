var _ = require('lodash');
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

function Post(obj) {
  this.id = obj.id;
  this.email = obj.email;
  this.path = obj.path;
  this.created = new Date;
}

Post.save = Post.prototype.save = function(callback) {
  objs[this.id] = this;
  if (callback) {
    callback();
  }
};

Post.find = Post.prototype.find = function(search, callback) {
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

db.model('Post', Post);

module.exports = db;
