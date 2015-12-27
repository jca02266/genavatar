var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/genavatar');

function validator32(v) {
  return true; // v.length === 32;
}
function validator(v) {
  return true; // v.length > 0;
}

var Post = new mongoose.Schema({
    id      : { type: String, validate: [validator32, "Bad md5 digest string"] }
  , email   : { type: String }
  , path   : { type: String, validate: [validator, "Empty Error"] }
  , created: { type: Date, default: Date.now }
});

exports.Post = db.model('Post', Post);
