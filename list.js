'use strict';

var config = require('config');
var dateformat = require('dateformat');
var fs = require('fs');
var path = require('path');

var FileWriter = require('./file_writer');
var utils = require('./utils');

var timestamp = dateformat(new Date(), 'yymmddHHMMssl');

var logger = utils.logger('list', timestamp);

try {
  if (process.argv.length < 3) {
    throw new Error('Arguments are poor.');
  }

  var targetDpath = process.argv[2];
  if (!fs.statSync(targetDpath).isDirectory()) {
    throw new Error('Not directory path.');
  }

  var opt = { extensions: null, names: null };
  if (5 <= process.argv.length) {
    switch (process.argv[3]) {
    case '-e':
      opt.extensions = [ process.argv[4] ];
      break;
    case '-n':
      opt.names = [ process.argv[4] ];
      break;
    case '-eg':
      opt.extensions = config.list.extensions[process.argv[4]];
      break;
    case '-ng':
      opt.names = config.list.names[process.argv[4]];
      break;
    default:
      throw new Error('Unsuported option type.');
    }
  }

  var writer = new FileWriter('./logs/list-' + timestamp + '.txt');

  var fileCount = 0;

  var walkDir = (rootDpath) => {
    logger.debug(rootDpath);

    var dpaths = [];
    var fpaths = [];
    fs.readdirSync(rootDpath).map((testPath) => {
      return path.resolve(rootDpath, testPath);
    }).forEach((testPath) => {
      if (fs.statSync(testPath).isDirectory()) {
        dpaths.push(testPath);
      } else {
        fpaths.push(testPath);
      }
    });

    if (opt.extensions !== null) {
      fpaths = fpaths.filter((fpath) => {
        var extension = utils.extension(fpath);
        return opt.extensions.indexOf(extension) !== -1;
      });
    } else if (opt.names !== null) {
      fpaths = fpaths.filter((fpath) => {
        var name = path.basename(fpath);
        return opt.names.indexOf(name) !== -1;
      });
    }

    fileCount += fpaths.length;

    fpaths.forEach((fpath) => {
      writer.line(fpath);
    });

    dpaths.forEach((dpath) => {
      walkDir(dpath);
    });
  };

  walkDir(path.resolve(targetDpath));

  writer.end();
  logger.info('File count: ' + fileCount);
} catch (e) {
  logger.error(e.stack);
}
