'use strict';

let gulp = require('gulp');
let mocha = require('gulp-spawn-mocha');
let mochaPhantomjs = require('gulp-mocha-phantomjs');
let fs = require('fs');

gulp.task('test', function () {
    return gulp.src(['test/**/*.js'])
        .pipe(mocha({
            timeout: 3000,
            reporter: 'list',
            istanbul: {
                dir: 'build/reports/coverage'
            }
        }));
});

gulp.task('unittestreport', function () {
    return gulp.src(['test/**/*.js'])
        .pipe(mocha({
            timeout: 3000,
            reporter: 'mocha-junit-reporter',
            istanbul: {
                dir: 'build/reports/coverage'
            }
        }));
});

