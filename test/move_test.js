'use strict';

var childProcess = require('child_process');

var testUtility = require('./test_utility');

Promise.resolve().then(() => {

  return testUtility.unzip('./test/resources/move_test_from.zip');

}).then(() => {

  return testUtility.unzip('./test/resources/move_test_to.zip');

}).then(() => {

  return new Promise((resolve, reject) => {
    childProcess.exec('node move ./tmp/move_test_to ./test/resources/move_test.txt', (err, stdout, stderr) => {
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
