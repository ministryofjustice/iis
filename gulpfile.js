var gulp = require('gulp');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');

gulp.task('test', function(){

});

gulp.task('browserify', function () {
    return gulp.src(['./client/js/*.js'])
    .pipe(browserify())
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'));
});

gulp.task('build', ['browserify']);

gulp.task('default', ['build']);
