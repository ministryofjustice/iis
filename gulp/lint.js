'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('lint-client', function () {
    return gulp.src(['./assets/javascripts/application.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('lint-server', function () {
    return gulp.src(['./server.js', './data/*.js', './routes/*.js', './server/*.js', './utils/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
