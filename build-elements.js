const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/type-writer-web-component/main-es2015.js',
    './dist/type-writer-web-component/polyfills-es2015.js',
    './dist/type-writer-web-component/runtime-es2015.js',
    './dist/type-writer-web-component/styles-es2015.js',
    './dist/type-writer-web-component/vendor-es2015.js'
  ];

  await fs.ensureDir('bundled-dist');
  await concat(files, 'bundled-dist/type-writer.js');
})();