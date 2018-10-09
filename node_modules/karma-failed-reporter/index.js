require('colors');

var FailedReporter = function(baseReporterDecorator, formatError) {
  baseReporterDecorator(this);

  this.failedSpecs = [];

  this.onRunComplete = function(browsers, results) {
    browsers.forEach(
        (function(browser, index) {
            if (results.failed) {
                this.write('\n' + browser + ' failed specs:\n'.red)
                if (this.failedSpecs[browser.id]) {
                    this.failedSpecs[browser.id].forEach(
                        (function(value, index) {
                            value.suite.forEach(
                                (function(value, index) {
                                    if(index === 0) {
                                        this.write('  ');
                                    }
                                    this.write(value + ' > '.grey);
                                }).bind(this)
                            );

                            // Write descrition and error to the list.
                            this.write(value.description + '\n');

                            var msg = '';
                            value.log.forEach(function(log) {
                                msg += formatError(log, '\t');
                            });
                            this.write(msg + '\n\n');
                        }).bind(this)
                    );
                }
            }
        }).bind(this)
    )

    this.write("\n");
    this.failedSpecs = [];
  };

  this.currentSuite = [];
  this.onSpecComplete = function(browser, result) {
      if (result.success === false) {
        if (!this.failedSpecs[browser.id]) {
            this.failedSpecs[browser.id] = [];
        }
        this.failedSpecs[browser.id].push(result);
      }
    }
};

FailedReporter.$inject = ['baseReporterDecorator', 'formatError'];

module.exports = {
  'reporter:failed': ['type', FailedReporter]
};
