// Gulp
var gulp = require('gulp');
var rename = require('gulp-rename');

// JS processing
var browserify = require('browserify');
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

// JS Quality
var jshint = require('gulp-jshint');

// JS Testing
var mochaPhantomjs = require('gulp-mocha-phantomjs');

// CSS
// todo

// Build tasks
gulp.task('default', ['build', 'test', 'watch']);

gulp.task('build', ['build-client']);

gulp.task('build-client', ['lint-client', 'browserify-client']);
gulp.task('build-test', ['lint-test', 'browserify-test']);

gulp.task('lint-client', function () {
    return gulp.src('./client/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('lint-test', function () {
    return gulp.src('./test/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('browserify-client', function () {

    return browserify({
        entries: './client/js/main.js',
        debug: true
    })
        .bundle()
        .pipe(source('hoa-min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('build'))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('browserify-test', function () {

    return browserify({
        entries: './test/client/index.js',
        debug: true
    })
        .bundle()
        .pipe(source('client-test.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('build'));
});


// Run gulp watch, then changes to client or client test js will trigger a rebuild and the test runner
gulp.task('watch', function () {
    gulp.watch('client/**/*.js', ['build-client']);
    gulp.watch('test/client/**/*.js', ['test']);
});

// Build the test JS then run the tests
gulp.task('test', ['build-test'], function () {
    return gulp.src('test/client/index.html')
        .pipe(mochaPhantomjs());
});