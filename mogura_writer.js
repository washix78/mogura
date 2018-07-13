'use strict';

var fs = require('fs');
var log4js = require('log4js');
var os = require('os');

log4js.configure('./config/log4js.json');

var log = log4js.getLogger('mogura_writer');

var MoguraWriter = function(fpath) {

  var ws = fs.createWriteStream(fpath).
    on('error', (err) => {
      log.error(err.stack);
    }).
    on('finish', () => {
      log.info('end');
    });

  this.line = (line) => {
    ws.write(line);
    ws.write(os.EOL);
  };

  this.array = (array) => {
    array.forEach((line) => {
      ws.write(line);
      ws.write(os.EOL);
    });
  };

  this.end = () => {
    ws.end();
  };
};

module.exports = MoguraWriter;
