'use strict';

var gulp = require('gulp');

gulp.task('copy-assets', function () {
  return gulp.src(['!assets/sass{,/**/*}', 'assets/**'])
  .pipe(gulp.dest('public'))
});

