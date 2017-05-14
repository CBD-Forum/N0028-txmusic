'use strict';
var browserify =  require('browserify')
  , fs         =  require('fs');

browserify()
  // .require(require.resolve('./javascript-editor'), { entry: true })
  .require(require.resolve('./src/app.js'), { entry: true })
  // .require(require.resolve('./json-editor'), { entry: true })
  // .require(require.resolve('./lua-editor'), { entry: true })
  .bundle({ debug: true })
  .pipe(fs.createWriteStream(__dirname + '/public/js/bundle.js'));
