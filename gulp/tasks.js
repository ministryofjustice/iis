'use strict';

let gulp = require("gulp");
require("./watch");

gulp.task(
    "watch",
    gulp.series("watch-assets", "watch-client-js", "watch-tests")
);



gulp.task("default");

gulp.task("dev", gulp.series("build", "watch", "server"));
