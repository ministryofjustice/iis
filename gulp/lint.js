var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('lint-client', function () {
    return gulp.src(['./assets/javascripts/application.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});


gulp.task('lint-server', function () {
    return gulp.src(['./server.js', './app/**/*.js', './server/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
