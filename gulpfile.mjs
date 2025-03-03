import gulp from 'gulp';
import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import browserSyncLib from 'browser-sync';
import { VueLoaderPlugin } from 'vue-loader';
import { fileURLToPath } from 'url';

const browserSync = browserSyncLib.create();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distFolder = 'dist';

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
        watch: false,
        cache: false,
        entry: './main.js',
        output: {
          filename: 'bundle.js',
          publicPath: '/',
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
  return gulp.src(['index.html', 'src/assets/**/*', 'src/stubs/**/*'], { base: '.' }).pipe(gulp.dest(distFolder));
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
  });

  gulp.watch(
    ['./main.js', './src/components/**/*.vue', './src/styles/**/*.scss', './index.html'],
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
