var assert = require('assert');
var db;

describe('Test for model.js', function() {
  beforeEach(function(done) {
    db = require('../model');
    done();
  });

  it('create model', function() {
    var Members = db.model('Members');
    assert.equal('function', typeof Members);
  });

  it('find for empty db', function() {
    var Members = db.model('Members');
    var member = new Members({id: 1, name: 'a@b'});
    assert.equal('object', typeof member);
    assert.equal(1,     member.id);
    assert.equal('a@b', member.name);

    Members.find({}, function(err, objs) {
      assert.equal(0, objs.length);
    });
  });

  it('find 1 entry', function() {
    var Members = db.model('Members');
    new Members({id: 1, name: 'a@b'}).save();

    Members.find({}, function(err, objs) {
      assert.equal(1,     objs.length);
      assert.equal(1,     objs[0].id);
      assert.equal('a@b', objs[0].name);
    });
  });

  it('entries is not found', function() {
    var Members = db.model('Members');
    new Members({id: 1, name: 'a@b'}).save();

    Members.find({id: 2}, function(err, objs) {
      assert.equal(0, objs.length);
    });
  });

  it('find 1 entry by name', function() {
    var Members = db.model('Members');
    new Members({id: 1, name: 'a@b'}).save();
    Members.find({id: 1}, function(err, objs) {
      assert.equal(1,     objs.length);
      assert.equal(1,     objs[0].id);
      assert.equal('a@b', objs[0].name);
    });

    Members.find({name: 'a@b'}, function(err, objs) {
      assert.equal(1,     objs.length);
      assert.equal(1,     objs[0].id);
      assert.equal('a@b', objs[0].name);
    });
  });

  it('find 2 entries', function() {
    var Members = db.model('Members');
    new Members({id: 1, name: 'a@b'}).save();
    new Members({id: 2, name: 'c@d'}).save();

    Members.find({}, function(err, objs) {
      assert.equal(2,     objs.length);
      assert.equal(1,     objs[0].id);
      assert.equal('a@b', objs[0].name);
      assert.equal(2,     objs[1].id);
      assert.equal('c@d', objs[1].name);
    });

    Members.find({id: 2}, function(err, objs) {
      assert.equal(1,     objs.length);
      assert.equal(2,     objs[0].id);
      assert.equal('c@d', objs[0].name);
    });
  });

  it('connection status always should return 1', function() {
    assert(1, db.connection.readyState);
  });
});
