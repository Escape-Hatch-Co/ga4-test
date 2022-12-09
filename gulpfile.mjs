import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import gulpAutoPrefixer from 'gulp-autoprefixer';
import gulpEslint from 'gulp-eslint';
import gulpHeader from 'gulp-header';
import gulpRename from 'gulp-rename';
import gulpReplace from 'gulp-replace';
import archiver from 'archiver';
import glob from 'glob';
import { deleteSync } from 'del';
import modernizr from 'modernizr';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');
const modernizrConfig = require('./modernizr-config.json');

const configs = pkg['h5bp-configs'];

const dirs = configs.directories;

const {ga4} = configs;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', (done) => {
  fs.mkdirSync(path.resolve(dirs.archive), '0755');
  done();
});

gulp.task('archive:zip', (done) => {
  const archiveName = path.resolve(dirs.archive, `${pkg.name}_v${pkg.version}.zip`);
  const zip = archiver('zip');
  const files = glob.sync('**/*.*', {
    'cwd': dirs.dist,
    'ignore': [
      '**/node_modules/**',
      'package-lock.json',
      '**/dist/**',
      '**/.cache/**',
    ],
    'dot': true // include hidden files
  });
  const output = fs.createWriteStream(archiveName);

  zip.on('error', (error) => {
    done();
    throw error;
  });

  output.on('close', done);

  files.forEach((file) => {
    const filePath = path.resolve(dirs.dist, file);

    // `zip.bulk` does not maintain the file
    // permissions, so we need to add files individually
    zip.append(fs.createReadStream(filePath), {
      'name': file,
      'mode': fs.statSync(filePath).mode
    });
  });

  zip.pipe(output);
  zip.finalize();
  done();
});

gulp.task('clean', (done) => {
  deleteSync([
    dirs.archive,
    dirs.dist
  ]);
  done();
});

gulp.task('copy:index.html', () => {

  let modernizrVersion = pkg.devDependencies.modernizr;
  let ga4Version = ga4.accountId;

  return gulp.src(`${dirs.src}/index.html`)
    .pipe(gulpReplace(/{{MODERNIZR_VERSION}}/g, modernizrVersion))
    .pipe(gulpReplace(/{{GA_TAG}}/g, ga4Version))
    .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:license', () =>
  gulp.src('LICENSE.txt')
    .pipe(gulp.dest(dirs.dist))
);

gulp.task('copy:style', () => {
  const banner = `/*! HTML5 Boilerplate v${pkg.version} | ${pkg.license} License | ${pkg.homepage} */\n\n`;

  return gulp.src('node_modules/main.css/dist/main.css')
    .pipe(gulpHeader(banner))
    .pipe(gulpAutoPrefixer({
      cascade: false
    }))
    .pipe(gulpRename({
      basename: 'style'
    }))
    .pipe(gulp.dest(`${dirs.dist}/css`));
});

gulp.task('copy:custom_style', () => {
  return gulp.src('src/css/main.css')
    .pipe(gulpAutoPrefixer({
      cascade: false
    }))
    .pipe(gulp.dest(`${dirs.dist}/css`));
});

gulp.task('copy:misc', () =>
  gulp.src([
    // Copy all files
    `${dirs.src}/**/*`,

    // Exclude the following files
    // (other tasks will handle the copying of these files)
    `!${dirs.src}/css/main.css`,
    `!${dirs.src}/index.html`
  ], {
    // Include hidden files by default
    dot: true
  }).pipe(gulp.dest(dirs.dist))
);

gulp.task('copy:normalize', () =>
  gulp.src('node_modules/normalize.css/normalize.css')
    .pipe(gulp.dest(`${dirs.dist}/css`))
);

gulp.task('lint:js', () =>
  gulp.src([
    `${dirs.src}/js/*.js`,
    `${dirs.test}/*.mjs`
  ]).pipe(gulpEslint())
    .pipe(gulpEslint.failOnError())
);

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------
gulp.task(
  'copy',
  gulp.series(
    'copy:index.html',
    'copy:license',
    'copy:style',
    'copy:custom_style',
    'copy:misc',
    'copy:normalize'
  )
);

gulp.task(
  'build',
  gulp.series(
    gulp.parallel('clean', 'lint:js'),
    'copy'
  )
);

gulp.task(
  'archive',
  gulp.series(
    'build',
    'archive:create_archive_dir',
    'archive:zip'
  )
);

gulp.task('default', gulp.series('build'));
