const gulp = require('gulp');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const browserSync = require('browser-sync');
// const browserify = require("browserify");
// const source = require('vinyl-source-stream');
// const buffer = require('vinyl-buffer');
// const tsify = require("tsify");
const tsProject = ts.createProject('tsconfig.json');

gulp.task('script', () => {
  return gulp.src('index.ts')
    .pipe(tsProject()).js
    .pipe(uglify())
    .pipe(rename('meisha-watch.js'))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', () => {
  browserSync.init({
    proxy: 'http://localhost:63342/MeiShaFEWatch'
  });
  gulp.watch('index.ts', ['script']);
  gulp.watch('*.html', browserSync.reload);
});

gulp.task('default', ['script']);
