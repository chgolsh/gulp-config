const { watch, series, parallel, src, dest } = require("gulp");

const del = require("del");
const browserSync = require("browser-sync").create();
const lessAutoprefix = require("less-plugin-autoprefix");
const autoprefix = new lessAutoprefix({ browsers: ["last 2 versions"] });

const babel = require("gulp-babel");
const less = require("gulp-less");
const cssnano = require("gulp-cssnano");
const posthtml = require("gulp-posthtml");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");

function clean() {
   return del(["dist"]);
}

function styles() {
    return src("src/less/*.less")
        .pipe(sourcemaps.init())
        .pipe(less({
            paths: ["src/less/components/", "node_modules/normalize.css/"],
            plugins: [autoprefix]
        }))
        .pipe(sourcemaps.write())
        .pipe(dest("dist/css/"))
        .pipe(browserSync.stream());
}

function html() {
    const plugins = [ 
        require('posthtml-include')({
            root: "src/html/components/"
        }) 
    ];

    return src("src/html/*.html")
        .pipe(posthtml(plugins))
        .pipe(dest("dist/"))
}

function minifyCss() {
    return src("dist/css/*.css")
        .pipe(cssnano())
        .pipe(dest("dist/css/"));
}

function uglifyJs() {
    return src("dist/js/*.js")
        .pipe(uglify())
        .pipe(dest("dist/js/"));
}

function liveReload() {
    browserSync.init({
        server: "./dist",
        port: 8080,
        browser: "chrome"
    });

    watch("src/less/**/*.less", { ignoreInitial: false }, styles);
    watch("src/scripts/**/*.js", { ignoreInitial: false }, javascript);
    watch("src/img/**/*", { ignoreInitial: false }, copyImage);
    watch("src/fonts/**/*", { ignoreInitial: false }, copyFonts);
    watch("src/html/**/*.html", { ignoreInitial: false }, html);
    watch("src/html/**/*.html").on("change", browserSync.reload);
}

function javascript() {
    return src("src/js/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(sourcemaps.write())
        .pipe(dest("dist/js/"))
}

function copyImage() {
    return src("src/img/**/*")
        .pipe(dest("dist/img/"))
}

function minifyImg() {
    return src("dist/img/**/*")
        .pipe(imagemin())
        .pipe(dest("dist/img/"))
}

function copyFonts() {
    return src("dist/fonts/**/*")
        .pipe(dest("dist/fonts/"))
}

exports.dist = series(clean, parallel(styles, html, javascript, copyImage, copyFonts), parallel(minifyCss, uglifyJs, minifyImg))
exports.default = series(clean, liveReload)
exports.test = series(clean, styles)