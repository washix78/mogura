'use strict';

var fs = require('fs');

var ws = fs.createWriteStream('./logs/test.logs').on('error', (err) => {
  console.log('error');
}).on('finish', () => {
  console.log('finish');
}).on('end', () => {
  console.log('end');
}).on('close', () => {
  console.log('close');
});

[
  'a',
  'b',
  'c',
  'd',
].forEach((x) => {
  console.log(x);
  ws.write(x);
});
ws.end();
console.log('OK');
