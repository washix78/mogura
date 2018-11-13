'use strict';

var childProcess = require('child_process');

var testUtility = require('./test_utility');

Promise.resolve().then(() => {

  // return testUtility.unzip('./test/resources/move_from_error_test.zip');

}).then(() => {

  // TODO before make directory ./tmp/move_from_error_test

  return new Promise((resolve, reject) => {
    childProcess.exec(
      'node move ./tmp ./test/resources/move_from_error_test.txt', (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

}).then(() => {

  console.log('End.');

}).catch((err) => {

  console.error(err.stack);

});
