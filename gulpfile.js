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
var sass = require('gulp-sass');

// Runs a sequence of gulp tasks
var runSequence = require('run-sequence');

// Build tasks
gulp.task('default', ['build', 'test', 'watch']);

gulp.task('build', ['build-client']);

gulp.task('build-client', ['generate-assets','lint-client', 'browserify-client']);
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
        .pipe(gulp.dest('./public/javascripts'));
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


// Run gulp watch, then changes to js or css will trigger a rebuild (and the test runner if js has changed)
gulp.task('watch', function () {
    //js
    gulp.watch('client/**/*.js', ['build-client']);
    gulp.watch('test/client/**/*.js', ['test']);

    //sass
    gulp.watch("client/sass/*.scss", ["sass"]);
});

// Build the test JS then run the tests
gulp.task('test', ['build-test'], function () {
    return gulp.src('test/client/index.html')
        .pipe(mochaPhantomjs());
});

// CSS pre-processing
/*
gulp.task('sass', function() {
    gulp.src('client/sass/*.scss')
        .pipe(sass())
        .pipe(rename('hoa-style.css'))
        .pipe(gulp.dest('public/stylesheets'));
})
*/


var config = require('./paths.json')

gulp.task('generate-assets', function (done) {
  runSequence('clean',
                'copy-govuk-modules',
                'sass',
                'sass-documentation',
                'copy-assets',
                'copy-documentation-assets', done)
})

gulp.task('copy-govuk-modules', [
  'copy-toolkit',
  'copy-template-assets',
  'copy-elements-sass',
  'copy-template'
])

var clean = require('gulp-clean')

gulp.task('clean', function () {
  return gulp.src([config.paths.public + '/*',
    config.paths.govukModules + '/*',
    '.port.tmp'], {read: false})
  .pipe(clean())
})

gulp.task('copy-toolkit', function () {
  return gulp.src(['node_modules/govuk_frontend_toolkit/**'])
  .pipe(gulp.dest(config.paths.govukModules + '/govuk_frontend_toolkit/'))
})

gulp.task('copy-template', function () {
  return gulp.src(['node_modules/govuk_template_jinja/views/layouts/**'])
  .pipe(gulp.dest(config.paths.govukModules + '/govuk_template/layouts/'))
  .pipe(gulp.dest(config.paths.lib))
})

gulp.task('copy-template-assets', function () {
  return gulp.src(['node_modules/govuk_template_jinja/assets/**'])
  .pipe(gulp.dest(config.paths.govukModules + '/govuk_template/assets/'))
})

gulp.task('copy-elements-sass', function () {
  return gulp.src(['node_modules/govuk-elements-sass/public/sass/**'])
  .pipe(gulp.dest(config.paths.govukModules + '/govuk-elements-sass/'))
})


var sourcemaps = require('gulp-sourcemaps')

gulp.task('sass', function () {
  return gulp.src(config.paths.assets + '/sass/*.scss')
  .pipe(sass({outputStyle: 'expanded',
    includePaths: ['govuk_modules/govuk_frontend_toolkit/stylesheets',
      'govuk_modules/govuk_template/assets/stylesheets',
      'govuk_modules/govuk-elements-sass/']}).on('error', sass.logError))
  .pipe(sourcemaps.init())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(config.paths.public + '/stylesheets/'))
})

gulp.task('sass-documentation', function () {
  return gulp.src(config.paths.docsAssets + '/sass/*.scss')
  .pipe(sass({outputStyle: 'expanded',
    includePaths: ['govuk_modules/govuk_frontend_toolkit/stylesheets',
      'govuk_modules/govuk_template/assets/stylesheets',
      'govuk_modules/govuk-elements-sass/']}).on('error', sass.logError))
  .pipe(sourcemaps.init())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(config.paths.public + '/stylesheets/'))
})


gulp.task('copy-assets', function () {
  return gulp.src(['!' + config.paths.assets + 'sass{,/**/*}',
    config.paths.assets + '/**'])
  .pipe(gulp.dest(config.paths.public))
})

gulp.task('copy-documentation-assets', function () {
  return gulp.src(['!' + config.paths.docsAssets + 'sass{,/**/*}',
    config.paths.docsAssets + '/**'])
  .pipe(gulp.dest(config.paths.public))
})

