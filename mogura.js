'use strict';

var dateformat = require('dateformat');
var fs = require('fs');
var config = require('config');
var log4js = require('log4js');
var os = require('os');
var path = require('path');


var timestamp = dateformat(new Date(), 'yymmddHHMMssl');

log4js.configure({
  'appenders': {
    'stdout': {
      'type': 'stdout'
    },
    'file': {
      'type': 'file',
      'filename': './logs/mogura-' + timestamp
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

  var opt = { extensions: null, names: null };
  if (6 <= process.argv.length) {
    switch (process.argv[4]) {
    case '-e':
      opt.extensions = [ process.argv[5] ];
      break;
    case '-n':
      opt.names = [ process.argv[5] ];
      break;
    case '-eg':
      opt.extensions = config.list.extensions[process.argv[5]];
      break;
    case '-ng':
      opt.names = config.list.names[process.argv[5]];
      break;
    default:
      throw new Error('Unsuported option type.');
    }
  }

  var ws = fs.createWriteStream('./logs/list-' + timestamp + '.txt').on('error', (err) => {
    throw err;
  });

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

    fileCount += fpaths.length;

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
