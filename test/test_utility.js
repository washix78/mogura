'use strict';

var fs = require('fs');
var unzip = require('unzip');

module.exports.unzip = (fpath) => {
  return new Promise((resolve, reject) => {
    var rs = fs.createReadStream(fpath).on('error', (err) => {
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
};
