'use strict';

var gulp = require('gulp');
var mocha = require('gulp-spawn-mocha');
var mochaPhantomjs = require('gulp-mocha-phantomjs');
var fs = require('fs');

gulp.task('test', function () {
    return gulp.src(['test/**/*.js'])
        .pipe(mocha({
            reporter: 'list',
            istanbul: {
                dir: 'build/reports/coverage'
            }
        }));
});

gulp.task('unittestreport', function () {
    return gulp.src(['test/**/*.js'])
        .pipe(mocha({
            reporter: 'mocha-junit-reporter',
            istanbul: {
                dir: 'build/reports/coverage'
            }
        }));
});

