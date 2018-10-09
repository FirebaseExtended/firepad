(function() {
  var CSVReporter;

  module.exports = CSVReporter = (function() {
    function CSVReporter(errorReport, options) {
      this.errorReport = errorReport;
      if (options == null) {
        options = {};
      }
      this.quiet = options.quiet;
    }

    CSVReporter.prototype.print = function(message) {
      return console.log(message);
    };

    CSVReporter.prototype.publish = function() {
      var e, errors, f, header, path, ref, results;
      header = ['path', 'lineNumber', 'lineNumberEnd', 'level', 'message'];
      this.print(header.join(','));
      ref = this.errorReport.paths;
      results = [];
      for (path in ref) {
        errors = ref[path];
        results.push((function() {
          var i, len, ref1, results1;
          results1 = [];
          for (i = 0, len = errors.length; i < len; i++) {
            e = errors[i];
            if (!(!this.quiet || e.level === 'error')) {
              continue;
            }
            if (e.context) {
              e.message += " " + e.context + ".";
            }
            f = [path, e.lineNumber, (ref1 = e.lineNumberEnd) != null ? ref1 : e.lineNumberEnd, e.level, e.message];
            results1.push(this.print(f.join(',')));
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    return CSVReporter;

  })();

}).call(this);
