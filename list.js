'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var os = require('os');
var path = require('path');

var utility = require('./utility');

var id = 'list-' + dateFormat('yyyyMMddhhmmssSSS', new Date());

var logger = utility.getLogger(id, config.logLevel);

var getName = (fpath) => {
  return path.basename(fpath);
};

try {
  // node list {dir_path}
  if (process.argv.length < 3 || !fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify directory path.');
  }

  var dirPath = path.resolve(process.argv[2]);
  logger.info(dirPath);

  var extension = null;
  var name = null;
  var extensions = [];
  var names = [];

  var fpathsFilter = null;
  // node list {dir_path} -{e_or_n_or_-eg_or_-ng} {extension_or_name}
  if (5 <= process.argv.length) {
    switch (process.argv[3]) {
    case '-e':
      extension = process.argv[4];
      fpathsFilter = (fpath) => {
        return extension === utility.getExtension(fpath);
      };
      break;
    case '-n':
      name = process.argv[4];
      fpathsFilter = (fpath) => {
        return name === getName(fpath);
      };
      break;
    case '-eg':
      extensions = config.list.extensions[process.argv[4]];
      fpathsFilter = (fpath) => {
        return 0 <= extensions.indexOf(utility.getExtension(fpath));
      };
      break;
    case '-ng':
      names = config.list.names[process.argv[4]];
      fpathsFilter = (fpath) => {
        return 0 <= names.indexOf(getName(fpath));
      };
      break;
    }
  }

  utility.walkDir(dirPath, (fpaths) => {
    if (fpathsFilter) {
      fpaths.filter(
        fpathsFilter
      ).forEach((fpath) => {
        ws.write(fpath);
        ws.write(os.EOL);
      });
    } else {
      fpaths.forEach((fpath) => {
        ws.write(fpath);
        ws.write(os.EOL);
      });
    }
  });

  ws.end();
} catch (e) {
  logger.error(e.stack);
}
