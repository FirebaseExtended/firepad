(function() {
  var JSLintReporter;

  module.exports = JSLintReporter = (function() {
    function JSLintReporter(errorReport, options) {
      this.errorReport = errorReport;
      if (options == null) {
        options = {};
      }
      this.quiet = options.quiet;
    }

    JSLintReporter.prototype.print = function(message) {
      return console.log(message);
    };

    JSLintReporter.prototype.publish = function() {
      var e, errors, i, len, path, ref, ref1;
      this.print('<?xml version="1.0" encoding="utf-8"?><jslint>');
      ref = this.errorReport.paths;
      for (path in ref) {
        errors = ref[path];
        if (errors.length) {
          this.print("<file name=\"" + path + "\">");
          for (i = 0, len = errors.length; i < len; i++) {
            e = errors[i];
            if (!this.quiet || e.level === 'error') {
              this.print("<issue line=\"" + e.lineNumber + "\"\n        lineEnd=\"" + ((ref1 = e.lineNumberEnd) != null ? ref1 : e.lineNumber) + "\"\n        reason=\"[" + (this.escape(e.level)) + "] " + (this.escape(e.message)) + "\"\n        evidence=\"" + (this.escape(e.context)) + "\"/>");
            }
          }
          this.print('</file>');
        }
      }
      return this.print('</jslint>');
    };

    JSLintReporter.prototype.escape = function(msg) {
      var i, len, r, replacements;
      msg = '' + msg;
      if (!msg) {
        return;
      }
      replacements = [[/&/g, '&amp;'], [/"/g, '&quot;'], [/</g, '&lt;'], [/>/g, '&gt;'], [/'/g, '&apos;']];
      for (i = 0, len = replacements.length; i < len; i++) {
        r = replacements[i];
        msg = msg.replace(r[0], r[1]);
      }
      return msg;
    };

    return JSLintReporter;

  })();

}).call(this);
