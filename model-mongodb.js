var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/genavatar');

function md5validator(id) {
  return id && !/[^0-9a-zA-Z.]/.test(id);
}

function sexValidator(v) {
  return v === null || v === 'male' || v === 'female';
}

var Post = new mongoose.Schema({
    id      : { type: String, validate: [md5validator, "Bad md5 digest string"] }
  , name    : { type: String }
  , sex     : { type: String, validate: [sexValidator, "{VALUE} is neither male nor female"] }
  , created: { type: Date, default: Date.now }
});

db.model('Post', Post);

module.exports = db;

db.connection.on('error', function (err) {
  console.log('Connection Error: ' + db.connection.readyState);
});

db.connection.on('open', function (err) {
  console.log('Connected to the MongoDB:' + db.connection.readyState);
});
