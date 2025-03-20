import gulp from 'gulp';
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import browserSyncLib from 'browser-sync';
import { VueLoaderPlugin } from 'vue-loader';

const browserSync = browserSyncLib.create();
const distFolder = 'dist';

global.app = {
  isBuild: process.argv.includes('--build'),
  isDev: !process.argv.includes('--build'),
  path: path,
  gulp: gulp,
};

const publicPath = global.app.isBuild ? '/table/' : './';

async function clean() {
  try {
    if (fs.existsSync(distFolder)) {
      fs.rmSync(distFolder, { recursive: true, force: true });
      console.log('dist очищен перед сборкой');
    }
  } catch (error) {
    console.error('Ошибка при очистке dist:', error);
  }
}

async function build() {
  return gulp
    .src('./main.js')
    .pipe(
      webpackStream({
        mode: global.app.isBuild ? 'production' : 'development',
        watch: false,
        cache: false,
        entry: './main.js',
        output: {
          filename: 'index.js',
          publicPath: publicPath,
        },
        resolve: {
          alias: {
            '@': path.resolve('src'),
            '@commons': path.resolve('src/components/commons'),
            '@pages': path.resolve('src/components/pages'),
            '@composables': path.resolve('src/components/composables'),
            '@api': path.resolve('src/api'),
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
              type: 'asset/resource',
              generator: {
                filename: 'assets/fonts/[name][ext]',
              },
            },
            {
              test: /\.svg$/,
              type: 'asset/resource',
              generator: {
                filename: 'assets/svg/[name][ext]',
              },
            },
          ],
        },
        devServer: {
          historyApiFallback: true,
          hot: true,
          open: true,
          port: 3000,
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
              watch: false,
            },
          }),
        ],
      }),
    )
    .pipe(gulp.dest(distFolder))
    .pipe(browserSync.stream());
}

function copyStatic() {
  return gulp
    .src('index.html')
    .pipe(gulp.dest(distFolder))
    .on('end', () => {
      return gulp.src('src/assets/**/*', { base: 'src/assets' }).pipe(gulp.dest(path.join(distFolder, 'assets')));
    });
}

function serve() {
  browserSync.init({
    server: {
      baseDir: distFolder,
      index: 'index.html',
    },
    open: true,
    notify: false,
    port: 3000,
    middleware: [
      function (req, res, next) {
        if (req.url.startsWith('/table')) {
          req.url = '/index.html';
        }
        next();
      },
    ],
  });

  gulp.watch(
    ['./main.js', './src/components/**/*.vue', './index.html'],
    gulp.series(clean, copyStatic, build, done => {
      browserSync.reload();
      done();
    }),
  );

  gulp.watch(
    './src/**/*.scss',
    gulp.series(clean, copyStatic, build, done => {
      browserSync.reload();
      done();
    }),
  );
}

export { clean };
export const buildTask = gulp.series(clean, copyStatic, build);
export const watch = gulp.series(clean, copyStatic, build, serve);
export default gulp.series(clean, copyStatic, build, serve);
