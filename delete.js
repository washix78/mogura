'use strict';

var config = require('config');
var dateformat = require('dateformat');
var fs = require('fs');
var log4js = require('log4js');
var readline = require('readline');

var FileWriter = require('./file_writer');

var timestamp = dateformat(new Date(), 'yymmddHHMMssl');

log4js.configure({
  'appenders': {
    'stdout': {
      'type': 'stdout'
    },
    'file': {
      'type': 'file',
      'filename': './logs/delete-' + timestamp + '.log'
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

  var listFpath = process.argv[2];
  if (fs.statSync(listFpath).isDirectory()) {
    throw new Error('Not file path');
  }

  var okWriter = new FileWriter('./logs/delete-success-' + timestamp + '.txt');
  var ngWriter = new FileWriter('./logs/delete-failure-' + timestamp + '.txt');

  var deletedCount = 0;
  var allCount = 0;

  readline.createInterface({
    input: fs.createReadStream(listFpath),
    crlfDelay: Infinity
  }).on('line', (deleteFpath) => {
    allCount += 1;
    try {
      fs.unlinkSync(deleteFpath);
      deletedCount += 1;
      okWriter(deleteFpath);
    } catch (fail) {
      logger.error(fail.stack);
      ngWriter(deleteFpath);
    }
  }).on('close', () => {
    logger.info('deleted count: ' + deletedCount + '/' + allCount);
  }).on('error', (err) => {
    throw err;
  })
} catch (e) {
  logger.error(e.stack);
}
