(function() {
  var RawReporter;

  module.exports = RawReporter = (function() {
    function RawReporter(errorReport, options) {
      this.errorReport = errorReport;
      if (options == null) {
        options = {};
      }
      this.quiet = options.quiet;
    }

    RawReporter.prototype.print = function(message) {
      return console.log(message);
    };

    RawReporter.prototype.publish = function() {
      var e, er, errors, path, ref;
      er = {};
      ref = this.errorReport.paths;
      for (path in ref) {
        errors = ref[path];
        er[path] = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = errors.length; i < len; i++) {
            e = errors[i];
            if (!this.quiet || e.level === 'error') {
              results.push(e);
            }
          }
          return results;
        }).call(this);
      }
      return this.print(JSON.stringify(er, void 0, 2));
    };

    return RawReporter;

  })();

}).call(this);
