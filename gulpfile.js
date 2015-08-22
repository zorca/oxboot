/*
 * Config
 */

var config = require('./config.json');

// Paths
var dest_path        =  config.path.pub;

/*
 * Gulp plugins
 */
var del = require('del'),
    gulp = require('gulp'),
    runsequence = require('run-sequence'),
    connect = require('gulp-connect-php'),
    browsersync = require('browser-sync'),
    reload  = browsersync.reload,
    plumber = require('gulp-plumber'),
    debug = require('gulp-debug'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    jade = require('gulp-jade'),
    less = require('gulp-less'),
    scss = require('gulp-sass'),
    csscomb = require('gulp-csscomb'),
    cssmin = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    templatesglob = require('gulp-jade-globbing'),
    stylesglob = require('gulp-css-globbing'),
    rename = require('gulp-rename');

// Destination Path if Development Mode On
if (config.options.dev_mode) {
    dest_path = config.path.dev
}

// Server task
gulp.task('server', function() {
    browsersync({
        proxy: '127.0.0.1:8010',
        port: 8080,
        open: true,
        notify: false
    });
    connect.server({
        base: dest_path+'/'+config.folder.templates+'/'+config.folder.template_name, port:8010, keepalive: true
    });
});

// Clean Destination folder
gulp.task('clean', function (cb) {
    del(dest_path+'*', cb);
});

// Jade task
gulp.task('templates', function() {
    return gulp.src(config.path.src+'/'+config.folder.templates+'/'+config.folder.template_name+'/**/[^_]*.jade')
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(templatesglob())
        .pipe(jade({
            pretty: true,
            locals: {
                "template_name": config.folder.template_name,
                "templates_folder": config.folder.templates,
                "dev_mode": config.options.dev_mode
            }
        }))
        .pipe(rename({
            extname: config.options.templates_ext
        }))
        .pipe(gulp.dest(dest_path+'/'+config.folder.templates+'/'+config.folder.template_name))
});

switch (config.options.css_pre) {
    case 'less':
        // Less task
        gulp.task('styles', function() {
            return gulp.src(config.path.src+'/'+config.folder.templates+'/'+config.folder.template_name+'/'+config.folder.styles+'/**/[^_]*.less')
                .pipe(stylesglob({
                    extensions: ['.css','.less'],
                    scssImportPath: {
                        leading_underscore: true,
                        filename_extension: false
                    }
                }))
                .pipe(less({errLogToConsole: true}))
                .pipe(gulpif(!config.options.dev_mode, cssmin()))
                .pipe(gulpif(!config.options.dev_mode, rename({extname: '.min.css'})))
                .pipe(gulp.dest(dest_path+'/'+config.folder.templates+'/'+config.folder.template_name+'/'+config.folder.styles));
        });
        break;
    case 'sass':
        // Sass task
        gulp.task('styles', function() {
            return gulp.src(config.path.src+'/'+config.folder.templates+'/'+config.folder.template_name+'/'+config.folder.styles+'/**/[^_]*.scss')
                .pipe(stylesglob({
                    extensions: ['.css','.scss'],
                    scssImportPath: {
                        leading_underscore: true,
                        filename_extension: false
                    }
                }))
                .pipe(scss({errLogToConsole: true}))
                .pipe(csscomb())
                .pipe(gulpif(!config.options.dev_mode, cssmin()))
                .pipe(gulpif(!config.options.dev_mode, rename({extname: '.min.css'})))
                .pipe(gulp.dest(dest_path+'/'+config.folder.templates+'/'+config.folder.template_name+'/'+config.folder.styles));
        });
    break
}

// Scripts task
gulp.task('scripts', function() {
    return gulp.src([config.path.src+'/'+config.folder.templates+'/'+config.folder.template_name+'/'+config.folder.scripts+'/**/[^_]*.js'])
        .pipe(gulp.dest(dest_path+'/'+config.folder.templates+'/'+config.folder.template_name+'/'+config.folder.scripts));
});

// Fonts task
gulp.task('fonts', function() {
    return gulp.src([config.path.src+'/'+config.folder.templates+'/'+config.folder.template_name+'/'+config.folder.fonts+'/**/*'])
        .pipe(gulp.dest(dest_path+'/'+config.folder.templates+'/'+config.folder.template_name+'/'+config.folder.fonts));
});

// Images task
gulp.task('images', function() {
    return gulp.src([config.path.src+'/'+config.folder.templates+'/'+config.folder.template_name+'/'+config.folder.images+'/**/*'])
        .pipe(gulp.dest(dest_path+'/'+config.folder.templates+'/'+config.folder.template_name+'/'+config.folder.images));
});

// Watch tasks
gulp.task('watch', function() {
    gulp.watch(config.path.src+'/'+config.folder.templates+'/'+config.folder.template_name+'/**/*.jade', ['templates' , reload]);
    gulp.watch(config.path.src+'/'+config.folder.templates+'/'+config.folder.template_name+'/**/*.less', ['styles', reload]);
    gulp.watch(config.path.src+'/'+config.folder.templates+'/'+config.folder.template_name+'/**/*.scss', ['styles', reload]);
    gulp.watch(config.path.src+'/'+config.folder.templates+'/'+config.folder.template_name+'/**/*.js', ['scripts', reload]);
});

// Default taskgulp
gulp.task('default', ['clean'], function() {
    runsequence('templates','styles','scripts','fonts','images','watch','server');
});
