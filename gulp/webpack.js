const webpackStream = require('webpack-stream');
const webpack2 = require('webpack');

const gulp = require('gulp');

gulp.task('webpack', [
    'webpackMoreless',
    'webpackReveal',
    'webpackAdmin',
    'webpackTabs',
    'webpackValidation'
]);

gulp.task('webpackMoreless', function() {
    return gulp.src(['./assets/javascripts/moreless/moreless.js', './assets/javascripts/moreless/longlist.js'])
        .pipe(webpackStream({
            output: {
                filename: 'morelessBundle.js'
            },
            module: {
                rules: [{
                    loader: 'babel-loader',
                    exclude: [/node_modules/],
                    query: {
                        presets: [['es2015', {'loose': true}]]
                    }
                }]
            },
            externals: {
                //  require("jquery") is external and available
                //  on the global var jQuery
                jquery: 'jQuery'
            }
        }, webpack2))
        .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('webpackReveal', function() {
    return gulp.src('./assets/javascripts/moreless/reveal.js')
        .pipe(webpackStream({
            output: {
                filename: 'revealBundle.js'
            },
            module: {
                rules: [{
                    loader: 'babel-loader',
                    exclude: [/node_modules/],
                    query: {
                        presets: [['es2015', {'loose': true}]]
                    }
                }]
            },
            externals: {
                //  require("jquery") is external and available
                //  on the global var jQuery
                jquery: 'jQuery'
            }
        }, webpack2))
        .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('webpackAdmin', function() {
    return gulp.src('./assets/javascripts/admin/tableFilter.js')
        .pipe(webpackStream({
            output: {
                filename: 'adminBundle.js'
            },
            module: {
                rules: [{
                    loader: 'babel-loader',
                    exclude: [/node_modules/],
                    query: {
                        presets: [['es2015', {'loose': true}]]
                    }
                }]
            },
            externals: {
                //  require("jquery") is external and available
                //  on the global var jQuery
                jquery: 'jQuery'
            }
        }, webpack2))
        .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('webpackTabs', function() {
    return gulp.src('./assets/javascripts/tabs/entryPoint.js')
        .pipe(webpackStream({
            output: {
                filename: 'tabs.js'
            },
            module: {
                rules: [{
                    loader: 'babel-loader',
                    exclude: [/node_modules/],
                    query: {
                        presets: [['es2015', {'loose': true}]]
                    }
                }]
            },
            externals: {
                //  require("jquery") is external and available
                //  on the global var jQuery
                jquery: 'jQuery'
            }
        }, webpack2))
        .pipe(gulp.dest('./public/javascripts'));
});

gulp.task('webpackValidation', function() {
    return gulp.src('./assets/javascripts/validation/index.js')
        .pipe(webpackStream({
            output: {
                filename: 'searchValidation.js'
            },
            module: {
                rules: [{
                    loader: 'babel-loader',
                    exclude: [/node_modules/],
                    query: {
                        presets: [['es2015', {'loose': true}]]
                    }
                }]
            },
            externals: {
                //  require("jquery") is external and available
                //  on the global var jQuery
                jquery: 'jQuery'
            }
        }, webpack2))
        .pipe(gulp.dest('./public/javascripts'));
});
