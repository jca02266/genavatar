var assert = require('assert');
var fse = require('fs-extra');
var path = require('path');

var avatarGenerator;
var imageDir = 'test-tmp/imageDir';
var cacheDir = 'test-tmp/cacheDir';

describe('avatar.js', function() {
  beforeEach(function() {
    fse.removeSync("test-tmp");
    assert.equal(false, fse.existsSync("test-tmp"));
    fse.mkdirsSync("test-tmp/imageDir");
    fse.mkdirsSync("test-tmp/cacheDir");

    avatarGenerator = require('../avatar');
  });
  it('return the function', function() {
    assert.equal('function', typeof avatarGenerator);
    var avatar = avatarGenerator({imageDir: imageDir, cacheDir: cacheDir});
    assert.equal('function', typeof avatar);
  });
  it('generate new image', function() {
    var avatar = avatarGenerator({imageDir: imageDir, cacheDir: cacheDir});
    var expectCachename = path.join('test-tmp', 'cacheDir', 'xxx-123.jpg');

    var promise = avatar('xxx', 123, 'male');
    assert.equal('object', typeof promise);

    assert.equal(false, fse.existsSync(expectCachename));
    return promise.then(function(filename) {
      assert.equal(expectCachename, filename);
      var stat = fse.statSync(expectCachename);
      assert.ok(stat.size > 0, 'stat.size > 0');
    });
  });
  it('reuse cached image', function() {
    var avatar = avatarGenerator({imageDir: imageDir, cacheDir: cacheDir});
    var expectCachename = path.join('test-tmp', 'cacheDir', 'xxx-123.jpg');

    // create a file 0 byte size
    fse.closeSync(fse.openSync(expectCachename, 'w'));
    assert.equal(true, fse.existsSync(expectCachename));

    var promise = avatar('xxx', 123, 'male');

    return promise.then(function(filename) {
      assert.equal(expectCachename, filename);
      var stat = fse.statSync(expectCachename);
      assert.equal(0, stat.size);
    });
  });
  it('reuse registered image', function() {
    var avatar = avatarGenerator({imageDir: imageDir, cacheDir: cacheDir});
    var expectCachename = path.join('test-tmp', 'cacheDir', 'xxx-123.jpg');
    var expectFilename = path.join('test-tmp', 'imageDir', 'xxx.jpg');

    // create image in imageDir
    fse.copySync('test/fixtures/sample.jpg', expectFilename);
    assert.equal(true, fse.existsSync(expectFilename));

    var promise = avatar('xxx', 123, 'male');

    return promise.then(function(filename) {
      assert.equal(expectCachename, filename);
      var stat = fse.statSync(expectCachename);
      assert.ok(stat.size > 0, 'stat.size > 0');
    });
  });
});
