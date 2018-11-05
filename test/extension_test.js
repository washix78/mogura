'use strict';

var childProcess = require('child_process');

var testUtility = require('./test_utility');

Promise.resolve().then(() => {
  return testUtility.unzip('./test/resources/extension_test.zip');
}).then(() => {
  return new Promise((resolve, reject) => {
    childProcess.exec('node ./extension ./tmp/extension_test', (err, stdout, stderr) => {
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