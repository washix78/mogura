'use strict';

var fs = require('fs');
var os = require('os');

var FileWriter = function(fpath) {
  var ws = fs.createWriteStream(
    fpath
  ).on('error', (err) => {
    throw err;
  });

  this.line = (line) => {
    ws.write(line);
    ws.write(os.EOL);
  };

  this.end = () => {
    ws.end();
  };
};

module.exports = FileWriter;
