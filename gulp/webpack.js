const webpackStream = require('webpack-stream');
const webpack2 = require('webpack');

const gulp = require('gulp');

gulp.task('webpack', function() {
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
