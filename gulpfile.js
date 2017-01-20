// Gulp
var gulp = require('gulp');
var rename = require('gulp-rename');

// JS processing
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');

// JS Quality
var jshint = require('gulp-jshint');

// JS Testing
var mochaPhantomjs = require('gulp-mocha-phantomjs');

// CSS
// todod

gulp.task('default', ['build-client']);

gulp.task('build-client', ['lint-client', 'browserify-client']);
gulp.task('build-test', ['lint-test', 'browserify-test']);

gulp.task('lint-client', function() {
    return gulp.src('./client/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('lint-test', function() {
    return gulp.src('./test/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('browserify-client', function () {
    return gulp.src(['./client/**/*.js'])
    .pipe(browserify())
    .pipe(uglify())
    .pipe(rename('index.js'))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('browserify-test', function () {
    return gulp.src(['./test/**/*.js'])
        .pipe(browserify())
        .pipe(uglify())
        .pipe(rename('client-test.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
    gulp.watch('client/**/*.js', ['build-client']);
    gulp.watch('test/client/**/*.js', ['test']);
});

gulp.task('test', ['build-test'], function() {
    return gulp.src('test/client/index.html')
        .pipe(mochaPhantomjs());
});
