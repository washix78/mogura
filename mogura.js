'use strict';

var fs = require('fs');
var config = require('config');
var log4js = require('log4js');
var os = require('os');
var path = require('path');

log4js.configure('./config/log4js.json');
var logger = log4js.getLogger('default');

try {
  if (process.argv.length < 4) {
    throw new Error('Arguments are poor.');
  }

  var targetDpath = process.argv[2];
  if (!fs.statSync(targetDpath).isDirectory()) {
    throw new Error('Not directory path.');
  }

  var type = process.argv[3];
  if ('list' !== type) {
    throw new Error('Unsupported type.')
  }

  var ws = fs.createWriteStream(config.list.out).on('error', (err) => {
    throw err;
  });

  var fileCount = 0;

  var walkDir = (rootDpath) => {
    logger.debug(rootDpath);

    var dpaths = [];
    var fpaths = [];
    fs.readdirSync(rootDpath).forEach((testPath) => {
      if (fs.statSync(testPath).isDirectory()) {
        dpaths.push(testPath);
      } else {
        fpaths.push(testPath);
      }
    });

    fileCount += fpaths.length;

    fpaths.forEach((fpath) => {
      ws.write(fpath);
      ws.write(os.EOL);
    });

    dpaths.forEach((dpath) => {
      walkDir(dpath);
    });
  };

  walkDir(path.resolve(targetDpath));
  ws.end();
  logger.info('file count: ' + fileCount);
} catch (e) {
  logger.error(e.stack);
}
