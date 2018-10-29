'use strict';

var config = require('config');
var os = require('os');

var utility = require('./utility');

var id = 'extension-' + dateFormat('yyyyMMddhhmmssSSS', new Date());

var logger = utility.getLogger(id, config.logLevel);

try {
  // node extension {dir_path}
  if (process.argv.length < 3 || !fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify directory path.');
  }

  var ws = fs.createWriteStream(
    './logs/' + id + '.txt'
  ).on('error', (err) => {
    logger.error(err.stack);
  }).on('', () => {

  });

  var dirPath = path.resolve(process.argv[2]);
  logger.info(dirPath);

  var extensions = new Set();

  logger.info('Start.');

  utility.walkDir(dirPath, (fpaths) => {
    fpaths.forEach((fpath) => {
      extensions.add(utility.getExtension(fpath));
    });
  });

  Array.from(extensions).sort().forEach((fpath) => {
    ws.write(fpath);
    ws.write(os.EOL);
  });

  logger.info('End.')

} catch (e) {
  logger.error(e.stack);
}
