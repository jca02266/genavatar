var assert = require('assert');
var fse = require('fs-extra');
var path = require('path');

var avatarGenerator;
var avatar;
var imageDir = 'test-tmp/imageDir';
var cacheDir = 'test-tmp/cacheDir';
var spy = {
  value: undefined,
  cached:   () => { spy.value = 'cached';    },
  resize:   () => { spy.value = 'resized';   },
  default:  () => { spy.value = 'default';   },
  generate: () => { spy.value = 'generated'; }
};

describe('avatar.js', function() {
  beforeEach(function() {
    fse.removeSync("test-tmp");
    assert.equal(false, fse.existsSync("test-tmp"));
    fse.mkdirsSync("test-tmp/imageDir");
    fse.mkdirsSync("test-tmp/cacheDir");

    avatarGenerator = require('../avatar');
    spy.value = undefined;
    avatar = avatarGenerator({
      imageDir: imageDir,
      cacheDir: cacheDir,
      spy: spy
    });
  });
  it('return the function', function() {
    assert.equal('function', typeof avatarGenerator);
    assert.equal('function', typeof avatar);
  });
  it('generate new image', function() {
    var expectCachename = path.join('test-tmp', 'cacheDir', 'xxx-123.jpg');

    assert.equal(undefined, spy.value);
    var promise = avatar('xxx', 123, 'male');
    assert.equal('object', typeof promise);

    assert.equal(false, fse.existsSync(expectCachename));
    return promise.then(function(filename) {
      assert.equal(expectCachename, filename);
      var stat = fse.statSync(expectCachename);
      assert.ok(stat.size > 0, 'stat.size > 0');
      assert.equal('generated', spy.value);
    });
  });
  it('generate new image with md5', function() {
    var expectCachename = path.join('test-tmp', 'cacheDir', '9091f9e8d5f0f8796d06ee321fec4631-123.jpg');

    // id has non alphanumeric value, change to md5
    assert.equal(undefined, spy.value);
    var promise = avatar('xxx-x', 123, 'male');
    assert.equal('object', typeof promise);

    assert.equal(false, fse.existsSync(expectCachename));
    return promise.then(function(filename) {
      assert.equal(expectCachename, filename);
      var stat = fse.statSync(expectCachename);
      assert.ok(stat.size > 0, 'stat.size > 0');
      assert.equal('generated', spy.value);
    });
  });
  it('reuse cached image', function() {
    var expectCachename = path.join('test-tmp', 'cacheDir', 'xxx-123.jpg');

    // create a file 0 byte size
    fse.closeSync(fse.openSync(expectCachename, 'w'));
    assert.equal(true, fse.existsSync(expectCachename));

    assert.equal(undefined, spy.value);
    var promise = avatar('xxx', 123, 'male');

    return promise.then(function(filename) {
      assert.equal(expectCachename, filename);
      var stat = fse.statSync(expectCachename);
      assert.equal(0, stat.size);
      assert.equal('cached', spy.value);
    });
  });
  it('reuse registered image', function() {
    var expectCachename = path.join('test-tmp', 'cacheDir', 'xxx-123.jpg');
    var expectFilename = path.join('test-tmp', 'imageDir', 'xxx.jpg');

    // create image in imageDir
    fse.copySync('test/fixtures/sample.jpg', expectFilename);
    assert.equal(true, fse.existsSync(expectFilename));

    assert.equal(undefined, spy.value);
    var promise = avatar('xxx', 123, 'male');

    return promise.then(function(filename) {
      assert.equal(expectCachename, filename);
      var stat = fse.statSync(expectCachename);
      assert.ok(stat.size > 0, 'stat.size > 0');
      assert.equal('resized', spy.value);
    });
  });
  it('use default image', function() {
    var expectCachename = path.join('test-tmp', 'cacheDir', 'xxx-123.jpg');
    var expectFilename = path.join('test-tmp', 'imageDir', 'xxx.jpg');

    // spcify the default image file
    var opt = {
      default_image_filename: path.resolve(__dirname, '../default_image/mystery-man.png'),
      default: true
    }
    assert.equal(undefined, spy.value);
    var promise = avatar('xxx', 123, 'male', opt);

    return promise.then(function(filename) {
      assert.equal(expectCachename, filename);
      var stat = fse.statSync(expectCachename);
      assert.ok(stat.size > 0, 'stat.size > 0');
      assert.equal('default', spy.value);
    });
  });
});
