const gulp = require('gulp');

const fs = require('fs');
const Ajv = require('ajv');
const assert = require('assert');
const PluginError = require('plugin-error');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const cssmin = require('gulp-minify-css');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const prefix = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const handlebars = require('gulp-compile-handlebars');
const eslint = require('gulp-eslint');
const gutil = require('gulp-util');
const sitemap = require('gulp-sitemap');
const hash = require('gulp-hash');
const inject = require('gulp-inject');
const robots = require('gulp-robots');
const clean = require('gulp-clean');

const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

// default task
gulp.task('default', function() {
  runSequence('clean','json-validate',['handlebars','json','scripts','styles','images','icon'],'inject','watch','browser-sync');
});

// build task
gulp.task('build', function() {
  runSequence('clean',['handlebars','json','scripts','styles','images','icon'],'inject','sitemap','robots','lint');
});

// clean task (deletes /dist dir)
gulp.task('clean', function () {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

// watch task
gulp.task('watch', function() {
  gulp.watch(['./src/handlebars/partials/*.handlebars', './src/handlebars/*.handlebars'], function() {
    runSequence('handlebars','inject', browserSync.reload);
  });
  gulp.watch('./src/json/*.json', function() {
    runSequence('json', browserSync.reload);
  });
  gulp.watch('./src/js/**/*.js', function() {
    runSequence('scripts','inject', browserSync.reload);
  });
  gulp.watch('./src/scss/*.scss', function() {
    runSequence('styles','inject', browserSync.reload);
  });
  gulp.watch(['./src/assets/*.jp*', './src/assets/*.png', './src/assets/*.svg', './src/assets/*.gif'], ['images']);
  gulp.watch('./src/assets/*.ico', ['icon']);
});

// Handlebars HTML build task
gulp.task('handlebars', function () {
  var templateData = {
  },
  options = {
    batch : ['./src/handlebars/partials']
  }

  return gulp.src('./src/handlebars/*.handlebars')
    .pipe(handlebars(templateData, options))
    .on('error', gutil.log)
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest('./'));
});

// json task
gulp.task('json', function() {
  return gulp.src('./src/json/*.json')
    .pipe(gulp.dest('./dist/json/'));
});

// scripts task
gulp.task('scripts', function() {
  return browserify({
      entries: './src/js/app.js',
    })
    .transform('babelify', {
      presets: [['@babel/env', {
        debug: true,
        targets: 'defaults', // see https://babeljs.io/docs/en/babel-preset-env#targets
        useBuiltIns: 'usage',
      }]]
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'))
    .on('error', gutil.log)
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(hash()) // Add hashes to the files' names
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/js/'))
    .pipe(hash.manifest('assetsJS.json', {
      deleteOld: true,
      sourceDir: __dirname + '/dist/js'
    })) // Switch to the manifest file
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/')); // Write the manifest file
});

// styles task
gulp.task('styles', function() {
  return gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .on('error', gutil.log)
    .pipe(prefix('last 2 versions'))
    .on('error', gutil.log)
    .pipe(concat('styles.css'))
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/css/'))
    .pipe(cssmin())
    .on('error', gutil.log)
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(hash()) // Add hashes to the files' names
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/css/'))
    .pipe(hash.manifest('assetsCSS.json', {
      deleteOld: true,
      sourceDir: __dirname + '/dist/css'
    })) // Switch to the manifest file
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/')); // Write the manifest file
});

// inject task
gulp.task('inject', function() {
  var options = {
    relative: true,
    addPrefix: '.'
  };
  var minSourceFiles = gulp.src(['./dist/js/app.min-*.js', './dist/css/styles.min-*.css'], {read: false});
  var targetFiles = gulp.src('./*.html');

  return targetFiles.pipe(inject(minSourceFiles, options)) // injects the latest minified JS and CSS into all HTML files
  .pipe(gulp.dest('./'));
});

// images task
gulp.task('images', function() {
  return gulp.src(['./src/assets/*.jp*', './src/assets/*.png',  './src/assets/*.svg', './src/assets/*.gif'])
    .pipe(imagemin())
    .on('error', gutil.log)
    .pipe(gulp.dest('./dist/assets/'));
});

// icon task
gulp.task('icon', function() {
  return gulp.src('./src/assets/*.ico')
    .pipe(gulp.dest('./dist/assets/'));
});

// json validation task
gulp.task('json-validate', function () {
  gutil.log('Validating config.json against config.schema.json');

  const objFromJson = (uri) => JSON.parse(fs.readFileSync(uri, 'utf-8'));
  const loadSchemaFn = (uri) => Promise.resolve(objFromJson(uri));
  const configJsonSchema = objFromJson('./src/json/config.schema.json');
  const configJson = objFromJson('./src/json/config.json');

  const ajv = new Ajv({loadSchema: loadSchemaFn, allErrors: true, extendRefs: 'fail', verbose: true});

  return ajv.compileAsync(configJsonSchema)
    .then(validate =>
      validate(configJson) ?
        gutil.log('config.json is valid!') :
        assert.fail(validate.errors.map(err => `\n${ajv.errorsText([err])}. Actual: "${err.data}"`).join().concat('\n'))
    )
    .catch(err => {
      throw new PluginError('json-validate', err, {showProperties: false});
    });
});

// lint task
gulp.task('lint', function() {
  return gulp.src('./dist/js/app.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// sitemap task
gulp.task('sitemap', function () {
  gulp.src(['./*.html', '!./banner.html'], {
      read: false
    })
    .pipe(sitemap({
      siteUrl: 'https://adoptopenjdk.net'
    }))
    .pipe(gulp.dest('./'));
});

// browser-sync task
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: './'
        },
        notify: false
    });
});

// robots task
gulp.task('robots', function () {
  gulp.src('index.html')
    .pipe(robots({
      useragent: '*',
      allow: ['/'],
      disallow: ['/404.html', '/banner.html', '/dist']
    }))
    .pipe(gulp.dest('./'));
});
