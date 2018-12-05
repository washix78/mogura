'use strict';

var childProcess = require('child_process');

var testUtility = require('./test_utility');

Promise.resolve().then(() => {

  return testUtility.unzip('./test/resources/rename_existed_error_test.zip');

}).then(() => {

  return new Promise((resolve, reject) => {
    childProcess.exec('node rename ./test/resources/rename_existed_error_test_before.txt ./test/resources/rename_existed_error_test_after.txt', (err, stdout, stderr) => {
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
