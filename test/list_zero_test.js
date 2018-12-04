'use strict';

var childProcess = require('child_process');

var testUnitily = require('./test_utility');

Promise.resolve().then(() => {

  return testUnitily.unzip('./test/resources/list_zero_test.zip');

}).then(() => {

  return new Promise((resolve, reject) => {
    childProcess.exec('node list ./tmp/list_zero_test -z', (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

}).then(() => {

  console.log('End');

}).catch((err) => {

  console.error(err.stack);

});
