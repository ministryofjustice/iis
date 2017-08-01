'use strict';

let gulp = require('gulp');

gulp.task('copy-assets', [
    'copy-local-assets',
    'copy-gov-assets',
]);

gulp.task('copy-local-assets', function() {
  return gulp.src(['!assets/sass{,/**/*}',
      '!assets/javascripts/search{,/**/*}',
      '!assets/javascripts/moreless{,/**/*}',
      '!assets/javascripts/admin{,/**/*}',
      '!assets/javascripts/results{,/**/*}',
      'assets/**'])
  .pipe(gulp.dest('public'));
});

gulp.task('copy-gov-assets', function() {
    return gulp.src(['govuk_modules/govuk_template/assets/stylesheets/govuk-template-ie8.css'])
        .pipe(gulp.dest('public/stylesheets'));
});
