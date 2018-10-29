'use strict';

var config = require('config');

var utility = require('./utility');

var id = 'extension-' + dateFormat('yyyyMMddhhmmssSSS', new Date());

var logger = utility.getLogger(id, config.logLevel);

try {
  // node extension {dir_path}
  if (process.argv.length < 3 || !fs.statSync(process.argv[2]).isDirectory()) {
    throw new Error('Please specify directory path.');
  }

  var dirPath = path.resolve(process.argv[2]);
  logger.info(dirPath);

  var extensions = new Set();

  logger.info('Start.');

  utility.walkDir(dirPath, (fpaths) => {
    fpaths.forEach((fpath) => {
      extensions.add(utility.getExtension(fpath));
    });
  });
  logger.info(extensions.size);

  var writer = utility.getFileWriter(logger, './logs/' + id + '.txt');

  Array.from(extensions).sort().forEach((extension) => {
    writer.write(extension);
  });

  writer.finish();
  logger.info('End.')

} catch (e) {
  logger.error(e.stack);
}
