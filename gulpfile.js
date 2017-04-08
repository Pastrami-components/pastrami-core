var gulp = require('gulp');
var pastramiTasks = require('@pastrami/pastrami-build');
gulp.task('build:debug:js', pastramiTasks.build.js.debug());
