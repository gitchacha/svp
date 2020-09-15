// Gulp
var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
var connect = require("gulp-connect");
var fileinclude = require("gulp-file-include");
var concat = require("gulp-concat");

var watch = {
  html: [
    "./src/fragment/*.html",
    "./src/pages/**/*.html",
    "./src/view/**/*.html",
  ],
  guideHtml: ["./src/_guide/html/*.html", "./src/_guide/guide.html"],
  scss: "./src/static/scss/**/*.scss",
  dummy: ["./src/static/js/dummy/**/*.js", "!./src/static/js/dummy/dummy.js"],
};
var src = {
  html: "./src/pages/**/*.html",
  guideHtml: "./src/_guide/*.html",
  scss: "./src/static/scss/*.scss",
  guideScss: "./src/_guide/scss/*.scss",
  dummy: ["./src/static/js/dummy/**/*.js", "!./src/static/js/dummy/dummy.js"],
};
var build = {
  html: "./src/build",
  guideHtml: "./src/_guide/build",
  scss: "./src/static/css",  
  portalScss: "C:/svms/workspace/svms-portal/src/main/resources/static/css",
  guideScss: "./src/_guide/css",
  dummy: "./src/static/js/dummy",
};

// html파일 인클루드
gulp.task("fileinclude", function () {
  return gulp
    .src(src.html)
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "./src/",
      })
    )
    .pipe(gulp.dest(build.html));
});

// 가이드 html 파일 인클루드
gulp.task("fileincludeGuide", function () {
  return gulp
    .src(src.guideHtml)
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "./src/_guide/html/",
      })
    )
    .pipe(gulp.dest(build.guideHtml));
});

// sass
gulp.task("sass", function () {
  return gulp
    .src(src.scss)
    .pipe(
      $.sass({
        includePaths: "sass",
        outputStyle: "compressed",
      }).on("error", $.sass.logError)
    )
    .pipe(gulp.dest(build.scss))
    .pipe(gulp.dest(build.portalScss))
    .pipe(connect.reload());
});

// 가이드 scss
gulp.task("sassGuide", function () {
  return gulp
    .src(src.guideScss)
    .pipe(
      $.sass({
        includePaths: "sass",
        outputStyle: "compressed",
      }).on("error", $.sass.logError)
    )
    .pipe(gulp.dest(build.guideScss))
    .pipe(connect.reload());
});

// dummy data JS concat
gulp.task("scripts", function () {
  return gulp
    .src(src.dummy)
    .pipe(concat("dummy.js"))
    .pipe(gulp.dest(build.dummy));
});

// gulp 서버
gulp.task("webserver", function () {
  return connect.server({
    livereload: true,
    port: 9001,
    root: "src/",
  });
});

gulp.task(
  "watch",
  gulp.series(gulp.parallel("sass", "fileinclude"), function () {
    gulp.watch(watch.html, gulp.series("fileinclude")),
      gulp.watch(watch.guideHtml, gulp.series("fileincludeGuide")),
      gulp.watch(watch.scss, gulp.parallel("sass", "sassGuide"));
    gulp.watch(src.guideScss, gulp.series("sassGuide"));

    gulp.watch(src.dummy, gulp.series("scripts"));
    return;
  })
);

gulp.task(
  "default",
  gulp.series(gulp.parallel("sass", "sassGuide", "webserver", "watch"))
);
