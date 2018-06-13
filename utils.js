'use strict';

var fs = require('fs');
var os = require('os');

module.exports = {
  getExtension: (src) => {
    var extensionI = src.lastIndexOf('.');
    if (extensionI !== -1) {
      var extension = src.substr(extensionI + 1);
      return extension;
    } else {
      return null;
    }
  },
  getAllFilePaths: (targetDirPath) => {
    var allFilePaths = [];
    new DirWalker(targetDirPath, (filePaths) => {
      Array.prototype.push.apply(allFilePaths, filePaths);
    }).start();
    return allFilePaths;
  },
  writeArrayToFile: (filePath, array) => {
    var ws = fs.createWriteStream(filePath).
      on('error', (err) => {
        throw err;
      });

    array.forEach((item) => {
      ws.write(item);
      ws.write(os.EOL);
    })
    ws.end();
  }
};
