var assert = require('assert');
var db;

describe('Test for model.js', function() {
  beforeEach(function(done) {
    db = require('../model');
    done();
  });

  it('create model', function() {
    var Post = db.model('Post');
    assert.equal('function', typeof Post);
  });

  it('find for empty db', function() {
    var Post = db.model('Post');
    var post = new Post({id: 1, email: 'a@b'});
    assert.equal('object', typeof post);
    assert.equal(1,     post.id);
    assert.equal('a@b', post.email);

    Post.find({}, function(err, objs) {
      assert.equal(0, objs.length);
    });
  });

  it('find 1 entry', function() {
    var Post = db.model('Post');
    new Post({id: 1, email: 'a@b'}).save();

    Post.find({}, function(err, objs) {
      assert.equal(1,     objs.length);
      assert.equal(1,     objs[0].id);
      assert.equal('a@b', objs[0].email);
    });
  });

  it('entries is not found', function() {
    var Post = db.model('Post');
    new Post({id: 1, email: 'a@b'}).save();

    Post.find({id: 2}, function(err, objs) {
      assert.equal(0, objs.length);
    });
  });

  it('find 1 entry by email', function() {
    var Post = db.model('Post');
    new Post({id: 1, email: 'a@b'}).save();
    Post.find({id: 1}, function(err, objs) {
      assert.equal(1,     objs.length);
      assert.equal(1,     objs[0].id);
      assert.equal('a@b', objs[0].email);
    });

    Post.find({email: 'a@b'}, function(err, objs) {
      assert.equal(1,     objs.length);
      assert.equal(1,     objs[0].id);
      assert.equal('a@b', objs[0].email);
    });
  });

  it('find 2 entries', function() {
    var Post = db.model('Post');
    new Post({id: 1, email: 'a@b'}).save();
    new Post({id: 2, email: 'c@d'}).save();

    Post.find({}, function(err, objs) {
      assert.equal(2,     objs.length);
      assert.equal(1,     objs[0].id);
      assert.equal('a@b', objs[0].email);
      assert.equal(2,     objs[1].id);
      assert.equal('c@d', objs[1].email);
    });

    Post.find({id: 2}, function(err, objs) {
      assert.equal(1,     objs.length);
      assert.equal(2,     objs[0].id);
      assert.equal('c@d', objs[0].email);
    });
  });

  it('connection status always should return 1', function() {
    assert(1, db.connection.readyState);
  });
});
