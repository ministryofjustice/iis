'use strict';

let gulp = require('gulp');
let sass = require('gulp-sass');
let sourcemaps = require('gulp-sourcemaps');


gulp.task('sass', function () {
  return gulp.src('assets/sass/*.scss')
  .pipe(sass({outputStyle: 'expanded',
    includePaths: ['govuk_modules/govuk_frontend_toolkit/stylesheets',
      'govuk_modules/govuk_template/assets/stylesheets',
      'govuk_modules/govuk-elements-sass/']}).on('error', sass.logError))
  .pipe(sourcemaps.init())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('public/stylesheets/'))
});


