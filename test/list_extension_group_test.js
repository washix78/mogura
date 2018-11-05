'use strict';

process.env['NODE_ENV'] = 'test';

var childProcess = require('child_process');

var testUtility = require('./test_utility');

Promise.resolve().then(() => {
  return testUtility.unzip('./test/resources/list_extension_group_test.zip');
}).then(() => {
  return new Promise((resolve, reject) => {
    childProcess.exec('node list ./tmp/list_extension_group_test -eg doc', (err, stdout, stderr) => {
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
