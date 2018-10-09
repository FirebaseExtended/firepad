(function() {
  // this is used for testing... best not to actually use
  var PassThroughReporter, RawReporter;

  RawReporter = require('./raw');

  module.exports = PassThroughReporter = class PassThroughReporter extends RawReporter {
    print(input) {
      return JSON.parse(input);
    }

  };

}).call(this);
