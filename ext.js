const fs = require('fs');
const os = require('os');
const path = require('path');

// node ext ${directory path}
// node ext ${directory path} -n
// node ext ${directory path} ${marker string}
// node ext ${directory path} -n ${marker string}
try {
  if (process.argv.length < 3) {
    throw new Error('Specify directory path.');
  }
  const [ , , testTargetDpath, ...options ] = process.argv;
  const targetDpath = path.resolve(testTargetDpath);
  if (!fs.statSync(targetDpath).isDirectory()) {
    throw new Error('Specify directory path.');
  }

  const onlyFname = (-1 < options.indexOf('-n'));
  const marker = options.find(opt => opt !== '-n');

  let outputFname;
  if (marker) {
    outputFname = `ext-${marker}.txt`;
  } else {
    const date = new Date();
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, 0);
    const d = date.getDate();
    const h = date.getHours().toString().padStart(2, 0);
    const min = date.getMinutes().toString().padStart(2, 0);
    const s = date.getSeconds().toString().padStart(2, 0);
    const ms = date.getMilliseconds().toString().padStart(3, 0);
    outputFname = `ext-${y}${m}${d}${h}${min}${s}${ms}.txt`;
  }
  const outputPath = `./logs/${outputFname}`;

  if (fs.existsSync(outputPath)) {
    throw new Error(`"${outputPath}" exists.`);
  }

  let extensionSet = new Set();
  let fnameSet = new Set();
  const walkDir = (topDpath) => {
    const names = fs.readdirSync(topDpath);
    let dpaths = [];
    names.forEach(name => {
      const testPath = path.resolve(topDpath, name);
      if (fs.statSync(testPath).isDirectory()) {
        dpaths.push(testPath);
      } else {
        const dotI = name.lastIndexOf('.');
        if (onlyFname) {
          if (dotI === -1) {
            fnameSet.add(name);
          }
        } else {
          if (0 <= dotI) {
            const extension = name.substring(dotI + 1);
            extensionSet.add(extension);
          }
        }
      }

      dpaths.forEach(dpath => {
        walkDir(dpath);
      });
    });
  };
  walkDir(targetDpath);

  const list = (onlyFname) ? Array.from(fnameSet).sort() : Array.from(extensionSet).sort();

  // ext-${timestamp}.txt
  // ext-${marker}.txt

  const ws = fs.createWriteStream(outputPath).on('error', err => { throw err });

  list.forEach(elm => {
    console.log(elm);
    ws.write(elm);
    ws.write(os.EOL);
  });
  ws.end();
  ws.close();
} catch (e) {
  console.error(e.stack);
}
