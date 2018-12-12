'use strict';

var childProcess = require('child_process');

var testUtility = require('./test_utility');

Promise.resolve().then(() => {

  return new Promise((resolve, reject) => {
    childProcess.exec('node rename ./test/resources/rename_item_count_error_test_before.txt ./test/resources/rename_item_count_error_test_after.txt', (err, stdout, stderr) => {
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
