const webpackStream = require('webpack-stream');
const webpack2 = require('webpack');

const gulp = require('gulp');

gulp.task('webpack', [
    'webpackSearch',
    'webpackMoreless',
]);

gulp.task('webpackSearch', function() {
    return gulp.src('./assets/javascripts/search/search.js')
        .pipe(webpackStream({
            output: {
                filename: 'searchBundle.js'
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

gulp.task('webpackMoreless', function() {
    return gulp.src('./assets/javascripts/moreless/moreless.js')
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
