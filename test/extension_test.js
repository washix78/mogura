'use strict';

var childProcess = require('child_process');
var fs = require('fs');
var unzip = require('unzip');

Promise.resolve().then(() => {
  return new Promise((resolve, reject) => {
    var rs = fs.createReadStream('./test/resources/extension_test.zip').on('error', (err) => {
      reject(err);
    });
    rs.pipe(unzip.Extract({
      path: './tmp'
    })).on('error', (err) => {
      reject(err);
    }).on('close', () => {
      resolve();
    });
  });
}).then(() => {
  childProcess.exec('node extension ./tmp/extension_test', () => {});

}).then((p) => {
  console.log(p);
}).catch((err) => {
  console.log(err.stack);
});
