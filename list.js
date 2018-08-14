'use strict';

var config = require('config');
var dateformat = require('dateformat');
var fs = require('fs');
var log4js = require('log4js');
var path = require('path');

var FileWriter = require('./file_writer');

var timestamp = dateformat(new Date(), 'yymmddHHMMssl');

log4js.configure({
  'appenders': {
    'stdout': {
      'type': 'stdout'
    },
    'file': {
      'type': 'file',
      'filename': './logs/list-' + timestamp + '.log'
    }
  },
  'categories': {
    'default': {
      'appenders': [ 'stdout', 'file' ],
      'level': config.logLevel
    }
  }
});

var logger = log4js.getLogger('default');

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
        var i = fpath.lastIndexOf('.');
        if (i === -1) {
          return false;
        }
        var extension = fpath.substr(i + 1);
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
  logger.info('file count: ' + fileCount);
} catch (e) {
  logger.error(e.stack);
}
