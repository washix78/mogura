const fs = require('fs');
const path = require('path');
const utility = require('./utility');

const main = async () => {
  const startTime = Date.now();

  try {
    const [ , , testTargetDpath, ...options ] = process.argv;
    if (!testTargetDpath || testTargetDpath.length === 0) {
      throw new Error('Not contains directory path.');
    }

    const targetDpath = path.resolve(testTargetDpath);
    if (!fs.statSync(targetDpath).isDirectory()) {
      throw new Error(`"${testTargetDpath}" is not directory.`);
    }

    const marker = utility.getOptionValue('-m', options);
    const outputPathPart = (marker !== null) ? marker : utility.getTimestamp();
    const outputPath = `./logs/file-${outputPathPart}.txt`;
    if (fs.existsSync(outputPath)) {
      throw new Error(`"${outputPath}" exists.`);
    }
    const writer = utility.getFileWriter(outputPath);

    const optTypes = [ '-e', '-n', '-ef', '-nf', '-mx' ];
    const filterType = options.find(val => optTypes.includes(val));

    const allAfter = (topDpath, fnames) => {
      fnames.sort().forEach(name => {
        const fpath = path.resolve(topDpath, name);
        writer.write(fpath);
      });
    };

    let filterElms = null;
    const extensionAfter = (topDpath, fnames) => {
      fnames.sort().forEach(name => {
        const extension = utility.getExtension(name);
        if (extension !== null && filterElms.includes(extension)) {
          const fpath = path.resolve(topDpath, name);
          writer.write(fpath);
        }
      });
    };
    const nameAfter = (topDpath, fnames) => {
      fnames.sort().forEach(name => {
        if (filterElms.includes(name)) {
          const fpath = path.resolve(topDpath, name);
          writer.write(fpath);
        }
      });
    };

    let size = 0;
    const sizeAfter = (topDpath, fnames) => {
      fnames.sort().forEach(name => {
        const fpath = path.resolve(topDpath, name);
        if (fs.statSync(fpath).size <= size) {
          writer.write(fpath);
        }
      })
    };

    let after = allAfter;

    if (filterType === '-e') {
      filterElms = utility.getOptionValues('-e', options);
      if (Array.isArray(filterElms) && 0 < filterElms.length) {
        after = extensionAfter;
      }
    } else if (filterType === '-n') {
      filterElms = utility.getOptionValues('-n', options);
      if (Array.isArray(filterElms) && 0 < filterElms.length) {
        after = nameAfter;
      }
    } else if (filterType === '-ef') {
      const efPath = utility.getOptionValue('-ef', options);
      if (efPath !== null && fs.statSync(efPath).isFile()) {
        filterElms = await utility.getLinesFromFile(efPath);
        if (Array.isArray(filterElms) && 0 < filterElms.length) {
          after = extensionAfter;
        }
      }
    } else if (filterType === '-nf') {
      const nfPath = utility.getOptionValue('-nf', options);
      if (nfPath !== null && fs.statSync(nfPath).isFile()) {
        filterElms = await utility.getLinesFromFile(nfPath);
        if (Array.isArray(filterElms) && 0 < filterElms.length) {
          after = nameAfter;
        }
      }
    } else if (filterType === '-mx') {
      size = utility.convertByte(utility.getOptionValue('-mx', options));
      if (size !== null) {
        after = sizeAfter;
      }
    }

    utility.walkDir(targetDpath, after);
    await writer.end();
  } catch (e) {
    console.error(`Error: ${e.message}`);
    console.log(e.stack);
  } finally {
    const endTime = Date.now();
    const time = endTime - startTime;
    console.log(`Time: ${time}`);
  }
};
main();
