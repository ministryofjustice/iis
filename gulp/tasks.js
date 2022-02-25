'use strict';

let gulp = require('gulp');
let runSequence = require('run-sequence');

gulp.task('default', function (done) {
    runSequence(
        'build', done)
});

gulp.task('dev', function (done) {
    runSequence(
        'build',
        'watch',
        'server', done)
});

gulp.task('build', function (done) {
    runSequence(
        'generate-assets',done)
});

gulp.task('generate-assets', function (done) {
    runSequence(
        'copy-govuk-modules',
        'sass',
        'webpack',
        'copy-assets', done)
});

gulp.task('watch', function (done) {
    runSequence(
        'watch-sass',
        'watch-assets',
        'watch-client-js',
        'watch-tests', done)
});
