(function() {
  var Cache, crypto, csVer, fs, ltVer, path;

  fs = require('fs');

  path = require('path');

  crypto = require('crypto');

  ltVer = require('./../package.json').version;

  csVer = ((typeof window !== "undefined" && window !== null ? window.CoffeeScript : void 0) || require('coffee-script')).VERSION;

  module.exports = Cache = (function() {
    function Cache(basepath) {
      this.basepath = basepath;
      if (!fs.existsSync(this.basepath)) {
        fs.mkdirSync(this.basepath, 0x1ed);
      }
    }

    Cache.prototype.path = function(source) {
      return path.join(this.basepath, csVer + "-" + ltVer + "-" + this.prefix + "-" + (this.hash(source)));
    };

    Cache.prototype.get = function(source) {
      return JSON.parse(fs.readFileSync(this.path(source), 'utf8'));
    };

    Cache.prototype.set = function(source, result) {
      return fs.writeFileSync(this.path(source), JSON.stringify(result));
    };

    Cache.prototype.has = function(source) {
      return fs.existsSync(this.path(source));
    };

    Cache.prototype.hash = function(data) {
      return crypto.createHash('md5').update('' + data).digest('hex').substring(0, 8);
    };

    Cache.prototype.setConfig = function(config) {
      return this.prefix = this.hash(JSON.stringify(config));
    };

    return Cache;

  })();

}).call(this);
