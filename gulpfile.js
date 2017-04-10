var gulp = require('gulp');
var battrTasks = require('@battr/battr-build');
gulp.task('build:debug:js', battrTasks.build.js.debug());
gulp.task('build:release:js', battrTasks.build.js.release());
