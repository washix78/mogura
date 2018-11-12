'use strict';

var fs = require('fs');
var log4js = require('log4js');
var os = require('os');
var path = require('path');
var readline = require('readline');

module.exports.getLogger = (name, level) => {
  log4js.configure({
    appenders: {
      stdout: {
        type: 'stdout'
      },
      file: {
        type: 'file',
        // ./logs/name.log
        filename: './logs/' + name + '.log'
      }
    },
    categories: {
      default: {
        appenders: [
          // 'stdout',
          'file'
        ],
        level: level
      }
    }
  });
  return log4js.getLogger('default');
};

var walkDir = (parentDpath, before, after) => {
  var paths = fs.readdirSync(parentDpath);
  var dpaths = [];
  var fpaths = [];
  paths.map((testPath) => {
    return path.resolve(parentDpath, testPath);
  }).forEach((testPath) => {
    if (fs.statSync(testPath).isDirectory()) {
      dpaths.push(testPath);
    } else {
      fpaths.push(testPath);
    }
  });

  if (before !== undefined && before !== null) {
    before(dpaths, fpaths);
  }

  dpaths.forEach((dpath) => {
    walkDir(dpath, before, after);
  });

  if (after !== undefined && after !== null) {
    after(dpaths, fpaths);
  }
};

module.exports.walkDir = walkDir;

module.exports.getExtension = (fpath) => {
  var fileName = path.basename(fpath);
  var idx = fileName.lastIndexOf('.');
  return (0 <= idx) ? fileName.substr(idx + 1) : null;
};

module.exports.getFileWriter = (fpath) => {
  return new function() {
    var ws = fs.createWriteStream(fpath).on('error', (err) => {
      throw err;
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

module.exports.getLinesFromFile = (fpath, lineFilter) => {
  return new Promise((resolve, reject) => {
    var lines = [];
    readline.createInterface({
      input: fs.createReadStream(fpath)
    }).on('error', (err) => {
      reject(err);
    }).on('close', () => {
      resolve(lines);
    }).on('line', (line) => {
      if (lineFilter !== undefined && lineFilter !== null) {
        if (lineFilter(line)) {
          lines.push(line);
        }
      } else {
        lines.push(line);
      }
    });
  });
};
