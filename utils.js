'use strict';

var fs = require('fs');
var log4js = require('log4js');
var path = require('path');

module.exports = {
  extension: (fpath) => {
    var name = path.basename(fpath);
    var i = path.basename(fpath).lastIndexOf('.');
    return i === -1 ? null : name.substr(i + 1);
  },
  logger: (type, timestamp, level) => {
    var conf = {
      appenders: {
        stdout: {
          type: 'stdout'
        },
        file: {
          type: 'file',
          filename: null
        }
      },
      categories: {}
    };
    conf.appenders.file.filename = './logs/' + type + '-' + timestamp + '.log';
    conf.categories[type] = {
      appenders: [ 'stdout', 'file' ],
      level: level
    };
    log4js.configure(conf);
    return log4js.getLogger(type);
  },
  walkDir: (rootDpath) => {
    var conf = {
      appenders: {
        stdout: {
          type: 'stdout'
        },
        file: {
          type: 'file',
          filename: null
        }
      },
      categories: {}
    };
    conf.appenders.file.filename = './logs/walk_dir-' + timestamp + '.log';
    conf.categories['walk_dir'] = {
      appenders: [ 'stdout', 'file' ]
    };
  }
};
