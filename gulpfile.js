const gulp = require('gulp');

const concat = require('gulp-concat');
const cssmin = require('gulp-minify-css');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const prefix = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');

// default task
gulp.task('default', ['scripts','styles','images','watch']);

// watch task
gulp.task('watch', function(){
  gulp.watch('./src/js/*.js', ['scripts']);
  gulp.watch('./src/scss/*.scss', ['styles']);
  gulp.watch(['./src/assets/*.jp*', './src/assets/*.png', './src/assets/*.gif'], ['images']);
});

// scripts task
gulp.task('scripts', function() {
  return gulp.src('./src/js/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/js/'));
});

// styles task
gulp.task('styles', function(){
  return gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .pipe(prefix('last 2 versions'))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(cssmin())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/css/'))
});

// images task
gulp.task('images', function(){
  return gulp.src(['./src/assets/*.jp*', './src/assets/*.png', './src/assets/*.gif'])
    .pipe(imagemin())
    .pipe(gulp.dest('./dist/assets/'))
});
