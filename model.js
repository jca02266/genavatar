var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/genavatar');

function md5validator(v) {
  return v === null || v.length === 32;
}

var Post = new mongoose.Schema({
    id      : { type: String, validate: [md5validator, "Bad md5 digest string"] }
  , email   : { type: String }
  , created: { type: Date, default: Date.now }
});

exports.Post = db.model('Post', Post);
