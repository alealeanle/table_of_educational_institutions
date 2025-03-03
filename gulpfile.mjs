import gulp from 'gulp';
import fs from 'fs';
import path from 'path';
import rename from 'gulp-rename';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import browserSyncLib from 'browser-sync';
import { VueLoaderPlugin } from 'vue-loader';

const browserSync = browserSyncLib.create();

async function clean() {
  try {
    if (fs.existsSync('bundle.js')) {
      fs.unlinkSync('bundle.js');
      console.log('✔️ bundle.js удалён');
    }
  } catch (error) {
    console.error('❌ Ошибка при удалении bundle.js:', error);
  }
}

async function build() {
  return gulp
    .src('./main.js')
    .pipe(
      webpackStream({
        mode: 'development',
        watch: true,
        cache: false,
        entry: './main.js',
        output: {
          filename: 'bundle.js',
        },
        resolve: {
          alias: {
            '@': path.resolve('src'),
            '@commons': path.resolve('src/components/commons'),
            '@pages': path.resolve('src/components/pages'),
            '@TablePage': path.resolve('src/components/pages/TablePage'),
          },
        },
        module: {
          rules: [
            {
              test: /\.vue$/,
              loader: 'vue-loader',
              options: {
                hotReload: true,
              },
            },
            {
              test: /\.css$/,
              use: ['vue-style-loader', 'css-loader'],
            },
            {
              test: /\.scss$/,
              use: [
                'vue-style-loader',
                'css-loader',
                {
                  loader: 'sass-loader',
                  options: {
                    additionalData: `@use "@/styles/fonts.scss" as *; @use "@/styles/colors.scss" as *; @use "@/styles/breakpoints.scss" as *; @use "@/styles/mixins.scss" as *;`,
                    sassOptions: {
                      includePaths: ['src/styles'],
                    },
                  },
                },
              ],
            },
            {
              test: /\.(woff2?|ttf|eot|otf)$/,
              type: 'asset/inline',
            },
          ],
        },
        plugins: [
          new VueLoaderPlugin(),
          new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: true,
          }),
          new webpack.LoaderOptionsPlugin({
            debug: true,
            options: {
              watch: true,
            },
          }),
        ],
      }),
    )
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({
    server: {
      baseDir: './',
      index: 'index.html',
    },
    open: true,
    notify: false,
    port: 3000,
  });

  gulp.watch(
    ['./main.js', './components/**/*.vue', './styles/**/*.scss', './index.html'],
    { ignoreInitial: false },
    gulp.series(clean, build, done => {
      browserSync.reload();
      done();
    }),
  );
}

export { clean };
export const buildTask = gulp.series(clean, build);
export const watch = gulp.series(clean, build, serve);
export default gulp.series(clean, build, serve);
