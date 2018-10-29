'use strict';

var fs = require('fs');
var log4js = require('log4js');
var os = require('os');
var path = require('path');

module.exports.getLogger = (name, level) => {
  log4js.configure({
    appenders: {
      stdout: {
        type: 'stdout'
      },
      file: {
        type: 'file',
        // ./logs/name.log
        filename: './logs/' + name + './log'
      }
    },
    categories: {
      default: {
        appenders: [
          'stdout',
          'file'
        ],
        level: level
      }
    }
  });
  return log4js.getLogger('default');
};

var walkDir = (parentDpath, execToFpaths) => {
  var paths = fs.readdirSync(parentDpath);
  var dpaths = [];
  var fpaths = [];
  paths.forEach((testPath) => {
    if (fs.statSync(testPath).isDirectory()) {
      dpaths.push(path.resolve(parentDpath, testPath));
    } else {
      fpaths.push(path.resolve(parentDpath, testPath));
    }
  });

  execToFpaths(fpaths);

  dpaths.forEach((dpath) => {
    walkDir(dpath, execToFpaths);
  });
};

module.exports.walkDir = walkDir;

module.exports.getExtension = (fpath) => {
  var idx = fpath.lastIndexOf('.');
  return (0 <= idx) ? fpath.substr(idx + 1) : null;
};

module.exports.getFileWriter = (logger, fpath) => {
  return new function(logger, fpath) {
    var ws = fs.createWriteStream(fpath).on('error', (err) => {
      logger.error(err);
    }).on('finish', () => {
      logger.info('End.');
    });

    this.write = (line) => {
      ws.write(line);
      ws.write(os.EOL);
    };

    this.finish = () => {
      ws.end();
      ws.close();
    };
  };
};
