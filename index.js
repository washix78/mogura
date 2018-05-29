'use strict';

var config = require('config');
var fs = require('fs');
var os = require('os');
var path = require('path');
var readline = require('readline');

var DirWalker = require('./dir_walker');

try {
  if (process.argv.length < 3) {
    throw new Error(/* TODO */);
  }
  if (process.argv.length < 4) {
    throw new Error(/* TODO */);
  }

  var targetDirPath = path.resolve(process.argv[2]);
  if (!fs.statSync(targetDirPath).isDirectory()) {
    throw new Error(/* TODO */);
  }

  var command = process.argv[3];
  var option = (5 < process.argv.length) ? process.argv[4] : null;
  if (command === 'list') {
    if (option === null) {
      var ws = fs.createWriteStream(config.data.list.filePath /* TODO */).on('error', (err) => {
        throw err;
      });
      new DirWalker(targetDirPath, (filePaths) => {
        filePaths.forEach((filePath) => {
          ws.write(filePath);
          ws.write(os.EOL);
        });
      }).start();
    } else if (option === '-e') {
      var extensions = [];
      new DirWalker(targetDirPath, (filePaths) => {
        filePaths.forEach((filePath) => {
          var fileName = path.basename(filePath);
          var extensionI = fileName.indexOf('.');
          if (extensionI !== -1) {
            var extension = fileName.substr(extensionI + 1);
            extensions.push(extension);
          }
        });
      }).start();
      logger.info('extension count: ' + extensions.length);

      var ws = fs.createWriteStream(config.data.list.extension.filePath).on('error', (err) => {
        throw err;
      });
      extensions.sort().forEach((extension) => {
        ws.write(extension);
        ws.write(os.EOL);
      });
    } else {
      var extensions = config.extension[option];
      if (extensions === undefined || extensions === null || extensions.length === 0) {
        throw new Error(/* TODO */);
      }

      var fileCount = 0;
      var ws = fs.createWriteStream(config.data.list.filePath).on('error', (err) => {
        throw err;
      });
      new DirWalker(targetDirPath, (testPaths) => {
        var filePaths = testPaths.filter((testPath) => {
          var fileName = path.basename(testPath);
          var matches = extensions.some((extension) => {
            return testPath.lastIndexOf(extension) !== -1;
          });
          return matches;
        });

        fileCount += filePaths.length;

        filePaths.forEach((filePath) => {
          ws.write(filePath);
          ws.write(os.EOL);
        });
      }).start();
      console.log(fileCount);
    }
  } else if (command === 'delete') {
    if (option === '-f') {

    } else {
      var rl = readline.createInterface({
        input: fs.createReadStream(config.data.delete.)
      });
    }
  } else {
    throw new Error(/* TODO */);
  }
} catch (e) {
  // TODO: output log
}
