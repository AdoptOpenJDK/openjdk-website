const gulp = require('gulp');
// We'd normally use ES7 style imports but for consistency we'll use require
const Ajv = require('ajv').default;
const addFormats = require('ajv-formats').default;
const assert = require('assert');
const base64img = require('base64-img');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const buffer = require('vinyl-buffer');
const clean = require('gulp-clean');
const cleanCss = require('gulp-clean-css');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const fs = require('fs');
const handlebars = require('gulp-compile-handlebars');
const hash = require('gulp-hash');
const imagemin = require('gulp-imagemin');
const inject = require('gulp-inject');
const log = require('fancy-log');
const PluginError = require('plugin-error');
const prefix = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sitemap = require('gulp-sitemap');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');

// clean task (deletes /dist dir)
gulp.task('clean', () => gulp.src('dist', {
  read: false,
  allowEmpty: true
}).pipe(clean()));

// json validation task
gulp.task('json-validate', () => {
  log('Validating config.json against config.schema.json');

  const objFromJson = (uri) => JSON.parse(fs.readFileSync(uri, 'utf-8'));
  const loadSchemaFn = (uri) => Promise.resolve(objFromJson(uri));
  const configJsonSchema = objFromJson('./src/json/config.schema.json');
  const configJson = objFromJson('./src/json/config.json');

  const ajv = new Ajv({
    loadSchema: loadSchemaFn,
    allErrors: true,
    verbose: true});

  addFormats(ajv);

  return ajv.compileAsync(configJsonSchema)
      .then(validate =>
          validate(configJson) ?
              log('config.json is valid!') :
              assert.fail(validate.errors.map(err => `\n${ajv.errorsText([err])}. Actual: "${err.data}"`).join().concat('\n'))
      )
      .catch(err => {
        throw new PluginError('json-validate', err, {
          showProperties: false
        });
      });
});

// json task
gulp.task('json', () => gulp.src('./src/json/*.json').pipe(gulp.dest('./dist/json/')));

// scripts task
gulp.task('scripts', () => {
  return browserify({
      entries: './src/js/entry.js',
    })
    .transform('babelify', {
      presets: [
        ['@babel/env', {
          debug: true,
          targets: 'defaults', // see https://babeljs.io/docs/en/babel-preset-env#targets
          useBuiltIns: 'usage',
        }]
      ]
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./dist/js/'))
    .pipe(uglify())
    .on('error', log)
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(hash()) // Add hashes to the files' names
    .on('error', log)
    .pipe(gulp.dest('./dist/js/'))
    .pipe(hash.manifest('assetsJS.json', {
      deleteOld: true,
      sourceDir: __dirname + '/dist/js'
    })) // Switch to the manifest file
    .on('error', log)
    .pipe(gulp.dest('./dist/')); // Write the manifest file
});

// styles task
gulp.task('styles', () => {
  return gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .on('error', log)
    .pipe(prefix('last 2 versions'))
    .on('error', log)
    .pipe(concat('styles.css'))
    .on('error', log)
    .pipe(gulp.dest('./dist/css/'))
    .pipe(cleanCss())
    .on('error', log)
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(hash()) // Add hashes to the files' names
    .on('error', log)
    .pipe(gulp.dest('./dist/css/'))
    .pipe(hash.manifest('assetsCSS.json', {
      deleteOld: true,
      sourceDir: __dirname + '/dist/css'
    })) // Switch to the manifest file
    .on('error', log)
    .pipe(gulp.dest('./dist/')); // Write the manifest file
});

// images task
gulp.task('images', () => {
  return gulp.src(['./src/assets/*.jp*', './src/assets/*.png', './src/assets/*.svg', './src/assets/*.gif'])
    .pipe(imagemin())
    .on('error', log)
    .pipe(gulp.dest('./dist/assets/'));
});

// icon task
gulp.task('icon', () => {
  return gulp.src('./src/assets/*.ico')
    .pipe(gulp.dest('./dist/assets/'));
});

// Handlebars HTML build task
gulp.task('handlebars', () => {
  const templateData = {};

  const options = {
    batch: ['./src/handlebars/partials'],
    helpers: {
      base64img: base64img.base64Sync
    }
  };

  return gulp.src('./src/handlebars/*.handlebars')
      .pipe(handlebars(templateData, options))
      .on('error', log)
      .pipe(rename({
        extname: '.html'
      }))
      .pipe(gulp.dest('./'));
});

// inject task
gulp.task('inject', () => {
  const options = {
    relative: true,
    addPrefix: '.'
  };
  const minSourceFiles = gulp.src(['./dist/js/app.min-*.js', './dist/css/styles.min-*.css'], {
    read: false
  });
  const targetFiles = gulp.src('./*.html');

  return targetFiles.pipe(inject(minSourceFiles, options)) // injects the latest minified JS and CSS into all HTML files
      .pipe(gulp.dest('./'));
});

// browser-sync task
gulp.task('browser-sync', (done) => {
  browserSync.init({
    server: {
      baseDir: './'
    },
    notify: false,
    watch: true
  });
  done();

});

gulp.task('watch', () => {
  gulp.watch(['./src/handlebars/partials/*.handlebars', './src/handlebars/*.handlebars'], gulp.series('handlebars', 'inject'));
  gulp.watch('./src/json/*.json', gulp.series('json'));
  gulp.watch('./src/js/**/*.js', gulp.series('scripts', 'inject'));
  gulp.watch('./src/scss/*.scss', gulp.series('styles', 'inject'));
  gulp.watch(['./src/assets/*.jp*', './src/assets/*.png', './src/assets/*.svg', './src/assets/*.gif'], gulp.series('images', 'handlebars'));
  gulp.watch('./src/assets/*.ico', gulp.series('icon'));
});

// sitemap task
gulp.task('sitemap', (done) => {
    gulp.src('./*.html', {
      read: false
    })
    .pipe(sitemap({
      siteUrl: 'https://adoptopenjdk.net'
    }))
    .pipe(gulp.dest('./'));
    done();
});

// lint task
gulp.task('lint', () => {
  return gulp.src('./dist/js/app.js')
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

// default task
gulp.task('default', gulp.series('clean', 'json-validate', gulp.parallel('json', 'scripts', 'styles', 'images', 'icon'), 'handlebars', 'inject', 'browser-sync', 'watch'));

// build task
gulp.task('build', gulp.series('clean', gulp.parallel('json', 'scripts', 'styles', 'images', 'icon'), 'handlebars', 'inject', 'sitemap', 'lint'));
