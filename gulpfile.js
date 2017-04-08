var gulp = require('gulp');
var pastramiTasks = require('@battr/battr-build');
gulp.task('build:debug:js', pastramiTasks.build.js.debug());
