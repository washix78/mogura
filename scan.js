'use strict';

var config = require('config');
var dateFormat = require('dateformat');
var fs = require('fs');
var os = require('os');
var path = require('path');

var utility = require('./utility');

var id = 'scan-' + dateFormat('yyyyMMddhhmmssSSS', new Date());

var logger = utility.getLogger(id, config.logLevel);

try {
  // node scan {dir_path}
  if (process.argv.length < 3 || !fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify directory path.');
  }

  var ws = fs.createWriteStream(
    './logs/' + id + '.txt'
  ).on('error', (err) => {
    logger.error(err.stack);
  }).on('', () => {

  });

  var dirPath = (path.resolve(process.argv[2]));

  utility.walkDir(dirPath, (fpaths) => {

  });


} catch (e) {
  logger.error(e.stack);
}
