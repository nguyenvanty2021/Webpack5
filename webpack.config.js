const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ResourceHintsWebpackPlugin = require("resource-hints-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const Critters = require("critters-webpack-plugin");
const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");
const webpack = require("webpack");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const PurgeCss = require("purgecss-webpack-plugin");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const smp = new SpeedMeasurePlugin();
const PreloadWebpackPlugin = require("preload-webpack-plugin");
const { NoEmitOnErrorsPlugin } = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CompressionPlugin = require("compression-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");
const glob = require("glob");
const purgePath = {
  src: path.join(__dirname, "src"),
};

// Sử dụng webpack-merge để dễ dàng chia sẻ và ghi đè cấu hình Webpack giữa môi trường phát triển và sản xuất, giúp quản lý cấu hình dễ dàng và tránh lặp code
// webpack.common.js
// const { merge } = require('webpack-merge');
// const commonConfiguration = require('./webpack.common');
// const productionConfiguration = require('./webpack.prod');
// const developmentConfiguration = require('./webpack.dev');
// module.exports = (env) => {
//   switch (env) {
//     case "production":
//       return merge(commonConfiguration, productionConfiguration);
//     case "development":
//       return merge(commonConfiguration, developmentConfiguration);
//     default:
//       throw new Error("No matching configuration was found!");
//   }
// };

// const { ModuleFederationPlugin } = require("webpack").container;
// const EsLintPlugin = require("eslint-webpack-plugin");

// speed-measure-webpack-plugin (SMP) cung cấp cái nhìn sâu sắc về thời gian mất cho mỗi plugin và loader, giúp bạn xác định điểm nghẽn hiệu suất trong quá trình build
// module.exports = smp.wrap({
//   plugins: [
//     // Các plugins của bạn ở đây
//   ],
// });

// file bundle này đầu vào 2 file, đầu ra 2 file (ở HtmlWebpack)
module.exports = {
  // Nếu bạn có custom loaders hoặc muốn giảm thời gian resolve loader, bạn có thể định cấu hình resolveLoader để chỉ định thư mục hoặc cách Webpack tìm loaders
  resolveLoader: {
    modules: ["node_modules", "path/to/custom/loaders"],
  },

  // giúp loại bỏ library "lodash" ra khỏi folder bundle (dist) để tận dụng các bản cache có sẵn trên CDN
  // Cấu hình Webpack để không bundle những thư viện nhất định mà thay vào đó, sử dụng các bản được host từ CDN. Điều này giúp giảm kích thước của bundle và tận dụng caching trên trình duyệt
  // Loại bỏ các thư viện lớn ra khỏi bundle của bạn và sử dụng chúng từ một CDN để giảm kích thước của bundle và tăng tốc độ tải trang
  // Khi sử dụng các thư viện lớn được host trên một CDN hoặc được bao gồm bởi một script tag khác, bạn có thể loại trừ chúng khỏi bundle của mình
  externals: {
    lodash: "_",
    jquery: "jQuery", // ví dụ sử dụng jQuery từ CDN,
    // Khi bạn sử dụng các thư viện phổ biến như React hoặc Vue, việc đánh dấu chúng là externals giúp giảm kích thước của bundle và tận dụng cache trình duyệt của người dùng
    react: "React",
    "react-dom": "ReactDOM",
  },

  // Cấu hình source maps cho môi trường phát triển để tối ưu hóa quá trình debug => chỉ dùng cho môi trường dev, giúp báo lỗi chi tiết ở file nào, nếu dùng mode: "development" thì không cần dòng này nữa
  // Chỉ sử dụng source maps trong môi trường phát triển để giảm kích thước file và tăng tốc độ build cho sản phẩm cuối
  // devtool: "eval-source-map",
  devtool: process.env.NODE_ENV === "development" ? "eval-source-map" : "none",

  // giúp giảm thời gian giải quyết các module bằng cách cung cấp 1 đường dẫn tuyệt đối or loại bỏ các phần mở rộng file không cần thiết
  // Cấu hình các alias trong Webpack giúp rút ngắn và đơn giản hóa các câu lệnh import, làm cho mã nguồn dễ đọc và bảo trì hơn
  resolve: {
    // Khi làm việc với các gói được liên kết tượng trưng (symlinked), như khi bạn sử dụng npm link hoặc yarn link, việc vô hiệu hóa resolve.symlinks có thể cải thiện hiệu suất
    symlinks: false,

    // Giảm thời gian resolve module bằng cách chỉ định rõ ràng các phần mở rộng file mà Webpack nên xử lý, giúp loại bỏ các query không cần thiết
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
    // Cấu hình các alias trong Webpack giúp rút ngắn và đơn giản hóa các câu lệnh import, làm cho mã nguồn dễ đọc và bảo trì hơn
    // Cấu hình alias cho các module hoặc thư viện thường xuyên được sử dụng trong dự án của bạn để rút ngắn và đơn giản hóa các câu lệnh import
    alias: {
      Components: path.resolve(__dirname, "src/components/"), // tất cả các file: js, jsx, ts, tsx trong folder components
      Images: path.resolve(__dirname, "src/images/"),
    },
  },

  // Tắt cảnh báo về hiệu suất cho các tài nguyên lớn
  // performance: {
  //   hints: false,
  // },
  // Cấu hình Webpack để cung cấp cảnh báo hoặc lỗi khi kích thước bundle vượt quá ngưỡng nhất định, giúp bạn nhận biết và xử lý kịp thời các vấn đề về hiệu suất
  performance: {
    maxAssetSize: 100000,
    maxEntrypointSize: 300000,
    hints: "warning",
  },

  // entry: './src/index.js'
  entry: {
    // điểm bắt đầu
    // bundle: "./src/index.js", // Dẫn tới file index.js ta đã tạo
    // nếu dùng cách này có thể thêm nhiều điểm bắt đầu và gộp nó lại thành 1 file duy nhất là: bundle
    // Định cấu hình multiple entry points trong Webpack để tạo ra nhiều bundle, cho phép bạn tối ưu hóa việc caching và giảm thời gian tải trang cho người dùng cuối
    index: "./src/index.js",
    index2: "./src/index2.js",
    // muốn đầu vào nhiều file nhưng khi export ra file bundle chỉ có 1 file thôi thì dùng cách này
    // main: ["./src/index.js", "./src/index2.js"],

    // DllPlugin cho phép chia các thư viện ra khỏi bundle chính và build chúng riêng biệt. Điều này có thể tăng tốc độ build đáng kể cho các dự án lớn:
    vendor: ["react", "react-dom", "lodash"],
  },

  // entry: path.resolve(__dirname, "src/index.js"),
  // trường hợp muốn tách ra thành 2 file riêng
  // entry: {
  //     index: './src/index.tsx',
  //     home: './src/home.tsx' // và thằng bundle.js ở dưới đổi thành [name].js
  // },
  // entry: {
  //     index1: './src/index.js',
  //     index2: './src/index2.js' // và thằng bundle.js ở dưới đổi thành [name].js
  // },
  output: {
    path: path.resolve(__dirname, "dist"), // output nó sẽ tạo ra 1 folder tên là dist ngoài cùng và có 1 file tên là: bundle.js
    // kết quả đầu ra sau khi đóng gói
    // và thằng bundle.js ở dưới đổi thành [name].js

    // filename: 'bundle.js', // output ra 1 file tên là bundle.js
    // thêm [chunkhash].js để mã hóa tên file script ở .html
    // filename: "[name].js", // output ra 1 file tên là bundle.js
    filename: "[name].[contenthash].js", // -> thêm [contenthash] vào để mã hoá tên file bundle
    // publicPath: "dist/", // vị trí file, img bắt đầu. VD: nếu tên img đóng gói xuất ra từ folder dist (nằm trong folder dist) tên là: dog.png thì khi đóng gói dường dẫn url img này trên web (khi click chuột phải vào ảnh) sẽ là: src="dist/dog.png"
    chunkFilename: "[name].[contenthash].chunk.js",
    publicPath: "",
    // nếu là publicPath: "https://image.com" -> thì img này khi đóng gói sẽ nằm trong folder dist vs url là: src="https://image.com/dog.png" (khi click chuột phải vào ảnh trên website)
    // or publicPath: 'http://localhost:9001/'
    // 4 dòng dưới có thể thay cho CleanWebpackPlugin (nếu không dùng CleanWebpackPlugin thì dùng 4 dòng này)
    // clean: {
    //   dry: true,
    //   keep: /\.css/,
    // },

    // cho phép tạo folder để lưu: img, font, video,... trong folder dist (or folder bundle) và mã hóa tên của các tài nguyên này
    assetModuleFilename: "images/[hash][ext]", // là folder images nằm trong folder bundle
    // hoặc có thể là như này:
    // assetModuleFilename: "static/[name].[contenthash][ext]"
    // hoặc như này
    // assetModuleFilename: 'assets/[name][ext]'

    // Webpack 5 giới thiệu tùy chọn clean trong cấu hình output, giúp tự động xóa thư mục output trước mỗi lần build, loại bỏ nhu cầu sử dụng clean-webpack-plugin
    clean: true, // giúp xóa hết folder dist đi trước khi build lại folder bundle (dist) mới để những file cũ, file dư thừa trong folder dist cũ không còn tồn tại nữa

    // DllPlugin cho phép chia các thư viện ra khỏi bundle chính và build chúng riêng biệt. Điều này có thể tăng tốc độ build đáng kể cho các dự án lớn:
    filename: "[name].dll.js", // nếu dùng filename này chắc bỏ filename ở trên
    library: "[name]_library",
  },
  // đang code thì dùng development -> release dự án thì dùng production
  // hay nói cách khác mode:development có báo lỗi chi tiết ở file nào luôn chứ không phải ở file bundle, còn mode:production không có báo lỗi chi tiết
  mode: "development", // // lệnh này sẽ làm cho webpack thông báo lỗi sẽ đến từ file nào luôn chứ không để lỗi ở bundle nữa hoặc dùng devtool: 'inline-source-map',
  // mode: "development": tối ưu hóa tốc độ build file, dễ đọc, dễ gỡ lỗi, tạo ra các source maps giúp dễ dàng tìm thấy lỗi ở file nào luôn chứ không phải chỉ đơn thuần thông báo lỗi trong folder bundle (dist) nhưng kích thước file sẽ năng hơn. Ngoài ra có "Hot Module Replacement (HMR)" giúp chỉ update lại các module có sự thay đổi thôi chứ không cần phải reload lại page
  // mode: "production": tối ưu hóa size file, hiệu suất gồm: minify mã nguồn, loại bỏ code không sử dụng và nén tệp, không có source maps vì nó không cần thiết ở env production vì có thể làm tăng kích thước file bundle (dist)

  // optimization này giúp giảm dung lượng khi sử dụng thư viện thứ 3
  // VD: khi sử dung lodash, mỗi component khai báo 1 lần
  // nhiều compo khai báo như v sẽ rất năng
  // optimi sẽ giúp tạo ra 1 nơi chứa lodash trong folder bundle và các component tự gọi lodash
  // mà k cần phải khai báo ra -> giúp giảm dung lượng file

  // giúp cấu hình các tối ưu hóa như: minify mã nguồn, tối ưu hóa kích thước tệp đầu ra, tạo cache,...
  optimization: {
    // Trong Webpack 5, emitOnErrors (trước đây là noEmitOnErrors trong Webpack 4) giúp kiểm soát việc output file có được tạo ra nếu có lỗi trong quá trình biên dịch hay không
    emitOnErrors: true, // Hoặc false để không emit nếu có lỗi

    // Tree shaking
    // Giúp phân tích các import and export trong ES6 để xác định và loại bỏ các code không sử dụng, giúp giảm kích thước các file bundle (dist) và cải thiện hiệu suất load page

    // Tạo một runtime chunk cho tất cả các entry points, hữu ích cho việc caching
    // Cấu hình optimization.runtimeChunk để tách mã runtime thành một file riêng biệt, giúp tối ưu hóa việc cache và giảm thiểu vấn đề cache bị lỗi khi có cập nhật
    runtimeChunk: "single", // Tạo một runtime chunk duy nhất để chứa mã webpack runtime, tách mã bootstrap của webpack ra khỏi các bundle để tối ưu hóa cache, điều chỉnh cấu hình runtimeChunk để tạo ra một chunk chứa chỉ bộ mã runtime của Webpack, giúp tối ưu hóa caching cho các chunk không thay đổi
    // runtimeChunk: {
    //   name: "runtime", // Đặt tên cho runtime chunk
    // },

    // Kích hoạt tree shaking, giúp loại bỏ mã không sử dụng khỏi bundle cuối cùng
    usedExports: true, // Tối ưu hóa hiệu suất giúp webpack loại bỏ các code không sử dụng từ các module, giúp giảm kích thước file bundle (dist)

    // moduleIds: "deterministic", // Giữ ID module ổn định giữa các build khác nhau
    moduleIds: "hashed", // Tối ưu hóa hiệu suất giúp tối ưu hóa việc tạo code nhận dạng duy nhất cho các module trong file bundle (dist), giúp giảm time build và tăng tốc độ load page

    concatenateModules: true, // Tối ưu hóa vòng lặp

    // giúp tối ưu hóa các module (library) bên thứ 3 như: antd, mui,... Giúp giảm kích thước các file bundle (dist) và tăng tốc độ load page
    splitChunks: {
      // Tách các mô-đun chia sẻ thành các chunk riêng biệt, tách các module async và sync
      // Áp dụng cho tất cả các loại chunks (async và non-async)
      chunks: "all",
      // minSize: 3000,

      // Kích thước tối thiểu của chunk để thực hiện split
      minSize: 20000, // Kích thước tối thiểu của một chunk, giúp giảm kích thước các file output và cải thiện hiệu suất load page của web

      // maxSize: 50000, // Kích thước tối đa của một chunk, giúp giảm kích thước các file output và cải thiện
      // Không giới hạn kích thước tối đa của chunk
      maxSize: 0,

      // Một module phải được chia sẻ ít nhất qua 1 chunks trước khi nó được split
      minChunks: 1,

      maxAsyncRequests: 30, // Số lượng request tối đa cho các import() đồng thời.
      maxInitialRequests: 30, // Số lượng request tối đa cho entry point.
      automaticNameDelimiter: "~", // Ký tự dùng để nối tên của các chunk được split.
      enforceSizeThreshold: 50000, // Ngưỡng kích thước tối thiểu cho việc áp dụng split chunks.

      // hiệu suất load page của web
      // Tách và nhóm các mô-đun chia sẻ, khi webpack biên dịch nó sẽ tách các module từ folder node_modules thành 1 file được gọi là "vendors.js" giúp tối ưu hóa việc load page và giảm thời gian load application
      // Phân chia code thành các chunks dựa trên các nhóm cache cụ thể để tối ưu hóa việc tải và cache trên trình duyệt
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors", // Tên chunk của vendors
          priority: -10, // Ưu tiên cao hơn
          enforce: true,
        },
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors", // nhóm này có tên là "vendors"
          chunks: "all", // giúp chia sẻ các module async và sync
          reuseExistingChunk: true, // Tái sử dụng chunk nếu chunk đó đã tồn tại.
        },
        styles: {
          name: "styles",
          test: /\.css$/,
          chunks: "all",
          enforce: true,
        },
        default: {
          minChunks: 2, // Số lần xuất hiện tối thiểu để tách chunk
          priority: -20, // Ưu tiên thấp hơn
          reuseExistingChunk: true, // Tái sử dụng chunk nếu chunk đó đã tồn tại.
        },
      },
    },

    // // Kích hoạt quá trình minification cho tất cả các asset
    minimize: true, // Giảm thiểu các mảng và đối tượng
    minimizer: [
      new OptimizeCSSAssetsPlugin(), // Sử dụng để minify CSS

      // Tự động giảm kích thước các tệp hình ảnh trong quá trình build với image-minimizer-webpack-plugin, giúp giảm đáng kể lượng dữ liệu cần tải
      new ImageMinimizerPlugin({
        minimizerOptions: {
          plugins: [
            ["gifsicle", { interlaced: true }],
            ["jpegtran", { progressive: true }],
            ["optipng", { optimizationLevel: 5 }],
          ],
        },
      }),

      // Sử dụng css-minimizer-webpack-plugin để tối ưu và minify các tệp CSS. Điều này giúp giảm kích thước của CSS, cải thiện thời gian tải trang
      new CssMinimizerPlugin(),

      // giúp giảm kích thước các file đầu ra như: bỏ space, bỏ tab, bỏ code không sử dụng, nén lại các biến và hàm,...
      new TerserPlugin({
        parallel: true, // Tính năng minify song song
        extractComments: false, // Không tạo ra file riêng cho comments
        terserOptions: {
          format: {
            comments: false,
          },
          ecma: 6,
          compress: {
            reduce_vars: false, // Giảm thiểu các biến
            drop_console: true,
          },
          mangle: {
            properties: false, // Không mã hóa các thuộc tính của đối tượng
          },
          // Cấu hình tùy chọn cho Terser
          output: {
            comments: false, // Loại bỏ comments trong file đầu ra
          },
        },
      }),
    ],
  },
  // Cấu hình webpack-dev-server để tăng cường hiệu suất dev:
  devServer: {
    contentBase: path.join(__dirname, "dist"),

    // thằng này chỉ dùng cho lệnh npm run build và npm run build-dev vì có serve

    // 3 dòng dưới ở lệnh trong package.json có rồi
    // compress: true,
    // port: 9000,
    // hot: true,

    open: true, // giống live server tự động mở trình duyệt mới
    compress: true,
    static: {
      directory: path.resolve(__dirname, "dist"), // phải giống vs dòng output -> path ở trên
    },
    // static: './dist',
    devMiddleware: {
      index: "index.html",
      writeToDisk: true,
    },
    historyApiFallback: true,
    // historyApiFallback: {
    //   index: "index2.html", // tên này phải giống với filename của new HtmlWebpackPlugin
    // },
    // contentBase: ''
  },
  module: {
    // Nếu bạn biết chắc chắn rằng một số module không có phụ thuộc, bạn có thể báo cho Webpack bỏ qua việc parse các module này để tiết kiệm thời gian build
    noParse: /jquery|lodash/,

    rules: [
      // Khi xử lý các tác vụ phức tạp như transpiling lớn JavaScript files, việc sử dụng thread-loader có thể giúp đẩy nhanh quá trình build bằng cách phân chia công việc ra nhiều luồng
      {
        test: /\.js$/,
        include: path.resolve("src"),
        use: ["thread-loader", "babel-loader"],
      },

      // Tích hợp ESLint và Prettier vào quá trình build Webpack giúp tự động khắc phục các vấn đề về coding style và đảm bảo mã nguồn tuân thủ các quy tắc đã định
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          "babel-loader",
          {
            loader: "eslint-loader",
            options: {
              fix: true, // Tự động sửa lỗi có thể
            },
          },
        ],
      },

      // Nếu bạn đang sử dụng các thư viện không cần thiết phải transpile qua Babel, hãy loại trừ chúng để tiết kiệm thời gian xử lý
      {
        test: /\.js$/,
        exclude: /node_modules\/(lodash|moment|another-large-lib)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },

      // {
      //   use: "babel-loader",
      //   test: /\.js$/,
      //   exclude: "/node_modules/",
      // },
      // hoặc thay thế 3 dòng ở trên thành
      // chuyển đổi es lớn hơn 6 thành es5 bằng cách sử dụng babel-loader
      {
        // tất cả các file .js sử dụng babel-loader
        // use: {
        //     options: {
        //         // presets: ['@babel/preset-env'] // đã setup bên file .babelrc rồi
        //     }
        // },
        use: [
          {
            loader: "babel-loader",
            // options: {
            //   presets: [
            //     [
            //       "@babel/preset-env",
            //       {
            //         targets: "defaults",
            //       },
            //     ],
            //     "@babel/preset-react",
            //   ],
            // },
            // options: {
            //   presets: ["babel/env"],
            //   plugins: ["babel/plugin-proposal-class-properties"]
            // }
          },
        ],
        // include: path.resolve(__dirname, "src"),
        // test là tìm những file có đuôi là gì đó
        // test: /\.(js|jsx|ts|tsx)$/, // Sẽ sử dụng babel-loader cho những file .js
        test: /\.(ts|js)x?$/, // tìm hết các file có đuôi là .js (dấu $ là kết thúc, nghĩa là những file kết thúc có đuôi là .js)
        exclude: "/(node_modules|bower_components)/", // không load folder node_modules giúp tăng tốc độ vì folder này rất nặng
        //exclude: '/node_modules/', // không load folder node_modules giúp tăng tốc độ vì folder này rất nặng
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/env"],
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      },

      // thread-loader có thể được sử dụng để chạy các loader trong một worker pool, giảm thời gian build đáng kể bằng cách tận dụng đa luồng
      {
        test: /\.js$/,
        include: path.resolve("src"),
        use: ["thread-loader", "babel-loader"],
      },

      // html-loader xử lý HTML như một module và tự động tối ưu hóa các tài nguyên bên trong, như là hình ảnh
      {
        test: /\.html$/,
        use: ["html-loader"],
      },

      // Đặt cache-loader trước các loader tốn kém về mặt tính toán (như babel-loader) để cache kết quả của loader và tái sử dụng trong các lần build sau, giảm thời gian build
      {
        test: /\.js$/,
        use: ["cache-loader", "babel-loader"],
        include: path.resolve("src"),
      },

      // Cấu hình Babel và Webpack để chỉ bao gồm các polyfills cần thiết dựa trên các trình duyệt bạn muốn hỗ trợ, sử dụng @babel/preset-env
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "usage",
                  corejs: 3,
                },
              ],
            ],
          },
        },
      },

      // Tối ưu hóa quá trình xử lý JavaScript bằng cách loại trừ thư mục node_modules khỏi quá trình biên dịch của Babel, giảm đáng kể thời gian build
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },

      // Các loader như babel-loader cho phép caching kết quả để giảm thời gian biên dịch khi các file không thay đổi
      // Kích hoạt caching cho babel-loader giúp giảm đáng kể thời gian biên dịch cho các lần build sau, bằng cách tái sử dụng kết quả từ các lần build trước
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      },

      // Sử dụng svg-sprite-loader để biên dịch các file SVG thành sprite sheets, giảm số lượng yêu cầu HTTP và tối ưu hóa tải trang
      {
        test: /\.svg$/,
        // use: ["svg-sprite-loader"],
        // or cách này
        use: [
          {
            loader: "svg-sprite-loader",
            options: {
              extract: true,
              publicPath: "/images/icons/",
            },
          },
          "svgo-loader",
        ],
      },

      // tách file .css ra ngoài bundle.js
      {
        // test là tìm những file có đuôi là gì đó
        test: /\.css$/, // Sử dụng style-loader, css-loader cho file .css
        // tất cả các file .css sử dụng style-loader và css-loader
        // import 2 thằng này vào mới nhận được css import ở component
        // use: ["style-loader", "css-loader"],
        use: [
          // Để tối ưu hóa việc tải trang và render, hãy tách CSS ra khỏi JavaScript. Điều này giúp trình duyệt tải và render trang nhanh hơn bằng cách tải song song CSS và JavaScript
          MiniCssExtractPlugin.loader,
          "style-loader",
          "css-loader",
          //   {
          //     loader: "postcss-loader",
          //     options: {
          //       postcssOptions: {
          //         plugins: [["postcss-preset-env", {}]],
          //       },
          //     },
          //   },
        ],
      },
      {
        // test là tìm những file có đuôi là gì đó
        test: /\.scss$/,
        // tất cả các file .css sử dụng style-loader và css-loader
        // import 2 thằng này vào mới nhận được css import ở component
        // use: ["style-loader", "css-loader", "sass-loader"],
        use: [
          // giúp tách CSS thành các file riêng biệt và loại bỏ các CSS không sử dụng
          MiniCssExtractPlugin.loader,
          "style-loader",
          "css-loader",
          "sass-loader",
          "postcss-loader",
        ],
      },
      // Trong Webpack 5, bạn có thể sử dụng asset modules để tối ưu hóa việc xử lý các loại tài nguyên như hình ảnh, fonts, và các tệp văn bản
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|svg)$/i,
        type: "asset/resource",
        parser: {
          dataUrlCondition: {
            maxSize: 3 * 1024, // img tối đa 3KB
          },
        },
        use: [
          "file-loader",
          {
            // Sử dụng image-webpack-loader để tối ưu hóa hình ảnh
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|svg)$/i,
        // Sử dụng responsive-loader để tự động tạo các phiên bản khác nhau của hình ảnh tại các độ phân giải khác nhau, giúp tải hình ảnh phù hợp với kích thước màn hình của người dùng, giảm băng thông và thời gian tải trang
        loader: "responsive-loader",
        options: {
          adapter: require("responsive-loader/sharp"),
          sizes: [375, 475, 576, 768, 912, 1024, 1280, 1366, 1440, 1680, 1920],
          name: "[name]-[width].[ext]",
        },
      },
      {
        // test là tìm những file có đuôi là gì đó
        test: /\.s[ac]ss$/,
        // tất cả các file .css sử dụng style-loader và css-loader
        // import 2 thằng này vào mới nhận được css import ở component
        // use: ["style-loader", "css-loader", "sass-loader"],
        use: [
          MiniCssExtractPlugin.loader,
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i, // có thể để svg ở đây và remove svg ở bên dưới
        type: "asset/resource",
        parser: {
          dataUrlCondition: {
            maxSize: 3 * 1024, // img tối đa 3KB
          },
        },
      },
      // Sử dụng assets modules trong Webpack 5 để quản lý fonts một cách hiệu quả, thay thế cho cấu hình loader cụ thể cho fonts
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, // font ở đây
        // type: "asset/inline",
        // or
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
      {
        test: /\.txt/,
        type: "asset/source",
      },
      {
        test: /\.hbs/,
        use: ["handlebars-loader"],
      },
    ],
  },
  plugins: [
    // Plugin này giúp các module ID không thay đổi giữa các build, cải thiện khả năng caching trên client
    new webpack.HashedModuleIdsPlugin(),

    // Hướng dẫn trình duyệt về việc nào resources cần được tải trước hoặc prefetch để tăng tốc độ tải trang
    new webpack.PrefetchPlugin("some-path/some-module"),
    new webpack.PreloadPlugin("some-path/some-other-module"),

    // Đối với các ứng dụng lớn, việc chia nhỏ bundle thành nhiều phần nhỏ hơn có thể giúp tải trang nhanh hơn và tận dụng tốt hơn bộ nhớ cache trên trình duyệt
    new webpack.optimize.AggressiveSplittingPlugin({
      minSize: 30000, // Byte
      maxSize: 50000, // Byte
    }),

    // Sử dụng Critters plugin để inline CSS quan trọng và trì hoãn tải các styles không quan trọng, cải thiện thời gian tải trang
    new Critters({
      preload: "swap",
      pruneSource: false,
    }),

    // Đối với các dự án nhỏ hoặc khi bạn muốn kiểm soát chặt chẽ số lượng chunks được tạo, LimitChunkCountPlugin có thể hữu ích
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 5, // Giới hạn số lượng chunks tối đa
    }),

    // Sử dụng Babel plugin này để thêm cú pháp cho import() động, cho phép bạn tải code một cách lười biếng hoặc on-demand, giảm kích thước bundle ban đầu
    "@babel/plugin-syntax-dynamic-import",

    // Cải thiện việc sử dụng polyfill trong dự án của bạn, giúp mã của bạn hoạt động trên các trình duyệt cũ hơn mà không làm phình to bundle
    [
      "@babel/plugin-transform-runtime",
      {
        corejs: 3,
      },
    ],

    // Thiết lập biến môi trường trong Webpack để phân biệt giữa môi trường production và dev, giúp loại bỏ code dành riêng cho debugging hoặc testing khỏi bản build cuối
    // new webpack.DefinePlugin({
    //   "process.env.API_URL": JSON.stringify(process.env.API_URL),
    // }),

    // giúp nén các file tài nguyên bằng gzip or brotli khi phục vụ chúng, giúp giảm kích thước tải về
    // compression-webpack-plugin nén các asset thành các định dạng như .gz hoặc .br, cho phép server gửi các phiên bản nén này đến trình duyệt, giảm thời gian tải
    // Giảm thời gian tải trang bằng cách nén các assets trước khi phục vụ chúng, sử dụng gzip hoặc brotli
    new CompressionPlugin({
      algorithm: "gzip",
      // test: /\.(js|css|html|svg)$/,
      test: /\.(js|css|html|svg|jsx|ts|tsx)$/,
    }),

    // preload-webpack-plugin có thể tự động tạo các thẻ <link rel="preload"> và <link rel="prefetch"> cho các assets, giúp trình duyệt tải trước các tài nguyên quan trọng
    // preload-webpack-plugin giúp tối ưu hóa việc load các thư viện quan trọng trước khi chúng thực sự được yêu cầu, thông qua việc sử dụng <link rel="preload">
    new PreloadWebpackPlugin({
      rel: "preload",
      as(entry) {
        if (/\.css$/.test(entry)) return "style";
        if (/\.woff$/.test(entry)) return "font";
        if (/\.png$/.test(entry)) return "image";
        return "script";
      },
      include: "initial",
    }),
    new PreloadWebpackPlugin({
      rel: "prefetch",
      include: "asyncChunks",
    }),

    // hêm thông tin bản quyền hoặc bất kỳ thông điệp nào khác vào đầu các file bundle của bạn sử dụng BannerPlugin. Điều này có thể hữu ích cho việc đánh dấu phiên bản hoặc môi trường build
    new webpack.BannerPlugin({
      banner: "Phiên bản 1.0.0 - Bản quyền bởi Công ty ABC",
    }),

    // EnvironmentPlugin là một cách tiện lợi để đảm bảo rằng các biến môi trường quan trọng được chuyển vào bundle của bạn, giúp bạn quản lý cấu hình cho các môi trường khác nhau một cách dễ dàng
    new webpack.EnvironmentPlugin(["NODE_ENV", "DEBUG_MODE"]),

    // Khi sử dụng chế độ watch của Webpack, bạn có thể muốn bỏ qua một số file hoặc thư mục để không gây ra quá trình rebuild không cần thiết. WatchIgnorePlugin giúp bạn làm điều đó
    new webpack.WatchIgnorePlugin({
      paths: [path.resolve(__dirname, "node_modules")],
    }),

    // DllPlugin cho phép chia các thư viện ra khỏi bundle chính và build chúng riêng biệt. Điều này có thể tăng tốc độ build đáng kể cho các dự án lớn
    // Sử dụng DLL Plugin để tách các thư viện lớn và không thay đổi thường xuyên ra khỏi quá trình build chính, giúp giảm đáng kể thời gian build và tải trang
    new webpack.DllPlugin({
      name: "[name]_library",
      path: path.join(__dirname, "dist", "[name]-manifest.json"),
    }),

    // resource-hints-webpack-plugin thêm các gợi ý tài nguyên vào HTML, như dns-prefetch, preconnect, preload, prefetch, để tăng tốc độ tải trang
    new ResourceHintsWebpackPlugin(),

    // Sử dụng WorkboxWebpackPlugin để tích hợp các service workers vào ứng dụng web của bạn, biến ứng dụng thành một Progressive Web App (PWA) tối ưu
    // Sử dụng WorkboxWebpackPlugin để tự động tạo các service worker, giúp ứng dụng của bạn tải nhanh hơn và làm việc offline
    // Tích hợp Service Workers vào dự án của bạn thông qua Workbox hoặc các công cụ tương tự để cải thiện tốc độ tải trang và cung cấp khả năng làm việc offline
    new WorkboxPlugin.GenerateSW({
      // các tùy chọn cho Workbox
      clientsClaim: true,
      skipWaiting: true,
    }),

    // Tăng tốc độ minify JavaScript bằng cách sử dụng webpack-parallel-uglify-plugin, giúp thực hiện quá trình này trên nhiều tiến trình, giảm thời gian cần thiết cho việc build:
    new ParallelUglifyPlugin({
      // Cấu hình
    }),

    // Hot Module Replacement (HMR) là một tính năng của Webpack Dev Server, giúp cải thiện trải nghiệm phát triển bằng cách tự động tải lại module trong trang web mà không cần phải làm mới trang => dùng cho môi trường dev
    new webpack.HotModuleReplacementPlugin(),

    // Giảm kích thước của bundle bằng cách không bao gồm các module hoặc các phần của thư viện không được sử dụng
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    // Tránh tạo output nếu có lỗi xảy ra trong quá trình build, giúp tiết kiệm thời gian và tài nguyên:
    new NoEmitOnErrorsPlugin(),

    // giúp cải thiện thời gian build bằng cách cache kết quả của các module giữa các lần build
    new HardSourceWebpackPlugin(),

    // Để tự động load các module mà không cần phải import chúng mỗi khi sử dụng. Điều này hữu ích với các thư viện như jQuery, Lodash, hoặc React trong một số tình huống cụ thể
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      _: "lodash",
      // Sử dụng React mà không cần import ở mỗi file
      React: "react",
      // Webpack shimming giúp giải quyết vấn đề tương thích và phụ thuộc giữa các thư viện, đảm bảo rằng mã của bạn có thể chạy mượt mà trên mọi môi trường => dòng này khác vs 3 dòng trên nha, nếu dòng này lỗi có thể ẩn đi
      join: ["lodash", "join"],
    }),

    // Sử dụng copy-webpack-plugin để sao chép các tài nguyên tĩnh vào thư mục bundle (dist) mà không cần import chúng vào JavaScript, giảm kích thước của bundle
    new CopyPlugin({
      patterns: [{ from: "source", to: "dest" }],
    }),

    // new EsLintPlugin(),
    new TerserPlugin(),

    // packet này dùng để clean tất cả các file: .css, bundle cũ (không dùng đến nữa) trước khi npm run build để tạo ra 1 file .css và bundle mới
    // clean-webpack-plugin tự động dọn dẹp thư mục dist trước mỗi lần build, đảm bảo rằng chỉ có các file mới nhất được phục vụ
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        "**/*",
        path.join(process.cwd(), "build/**/*"),
      ],
    }),
    // packet này giúp tạo ra cùng 1 lượt với file bundle, .css nó là .html -> không cần phải đổi lại tên script, .css trong file html này mỗi lần npm run build
    // hay nói cách khác mỗi lần npm run build sẽ mã hoá tạo ra 1 tên file bundle, .css khác nhau, packet này sẽ tự tạo ra 1 file .html chứa .css và bundle mã hoá sau mỗi lần npm run build
    // nếu đầu vào là 2 file mà chỉ có 1 HtmlWebpackPlugin thì ở file index.html (trong folder bundle) sẽ có 2 script và 2 link .css
    // new HtmlWebpackPlugin({
    //   // title của file .html mỗi khi npm run build tạo 1 bundle, .css, .html mới
    //   title: "Hello world index1",
    //   // đường dẫn chứa file .html mỗi khi npm run build tạo 1 bundle, .css, .html mới
    //   // filename: "subfolder/custom_filename.html",
    //   // nội dung file .html mỗi khi npm run build sẽ được tạo ra dựa vào mẫu templay này
    //   template: "src/index.hbs",
    //   description: "Index1 description",
    //   // trường hợp đầu vào entry là 2 file trở lên, thì lệnh minify này giúp khai báo ra các: script, link css tương ứng với mỗi file
    //   // VD: đầu vào 2 file sẽ có 2 script và 2 link css
    //   minify: false,
    //   // meta: {
    //   //   description: "Some description",
    //   // },
    //   // templateContent: `
    //   // <!DOCTYPE html>
    //   // <html>
    //   //   <head>
    //   //     <meta charset="utf-8" />
    //   //     <title>Hello world</title>
    //   //     <meta name="description" content="Some description" />
    //   //     <meta name="viewport" content="width=device-width,initial-scale=1" />
    //   //   </head>
    //   //   <body><div id="root"></div></body>
    //   // </html>
    //   // `,
    // }),
    // packet này giúp tạo ra cùng 1 lượt với file bundle, .css nó là .html -> không cần phải đổi lại tên script, .css trong file html này mỗi lần npm run build
    // hay nói cách khác mỗi lần npm run build sẽ mã hoá tạo ra 1 tên file bundle, .css khác nhau, packet này sẽ tự tạo ra 1 file .html chứa .css và bundle mã hoá sau mỗi lần npm run build
    // nếu đầu vào là 2 file mà chỉ có 1 HtmlWebpackPlugin thì ở file index.html (trong folder bundle) sẽ có 2 script và 2 link .css
    // thông thường đầu vào bao nhiêu file thì phải dùng bấy nhiêu new HtmlWebpackPlugin
    // HtmlWebpackPlugin tự động tạo file HTML cho ứng dụng của bạn, inject các assets vào đúng vị trí. Điều này đặc biệt hữu ích khi làm việc với multiple entry points hoặc khi muốn tối ưu cache
    new HtmlWebpackPlugin({
      // title của file .html mỗi khi npm run build tạo 1 bundle, .css, .html mới
      // title: "Hello world index",
      title: "Caching",
      // filename: "index.html", // đầu ra tên file .html trong folder bundle, nếu đầu vào là 1 file thì k có 2 dòng: filename và chunks
      filename: "[name].[contenthash].html",
      chunks: "index", // tên chunks này phải giống với đầu vào ở trên // tên giống với name của entry
      // chunks: ['index'] // tên giống với name của entry
      // đường dẫn chứa file .html mỗi khi npm run build tạo 1 bundle, .css, .html mới
      // filename: "subfolder/custom_filename.html",
      // nội dung file .html mỗi khi npm run build sẽ được tạo ra dựa vào mẫu templay này
      template: "src/index.hbs", // tên giống với name của entry
      // template: path.resolve(__dirname, "src/index.html") // tên giống với name của entry
      description: "Index description",
      // trường hợp đầu vào entry là 2 file trở lên, thì lệnh minify này giúp khai báo ra các: script, link css tương ứng với mỗi file
      // VD: đầu vào 2 file sẽ có 2 script và 2 link css
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      inject: true,
      // meta: {
      //   description: "Some description",
      // },
      // templateContent: `
      // <!DOCTYPE html>
      // <html>
      //   <head>
      //     <meta charset="utf-8" />
      //     <title>Hello world</title>
      //     <meta name="description" content="Some description" />
      //     <meta name="viewport" content="width=device-width,initial-scale=1" />
      //   </head>
      //   <body><div id="root"></div></body>
      // </html>
      // `,
    }),
    // packet này giúp tạo ra cùng 1 lượt với file bundle, .css nó là .html -> không cần phải đổi lại tên script, .css trong file html này mỗi lần npm run build
    // hay nói cách khác mỗi lần npm run build sẽ mã hoá tạo ra 1 tên file bundle, .css khác nhau, packet này sẽ tự tạo ra 1 file .html chứa .css và bundle mã hoá sau mỗi lần npm run build
    // nếu đầu vào là 2 file mà chỉ có 1 HtmlWebpackPlugin thì ở file index.html (trong folder bundle) sẽ có 2 script và 2 link .css
    // nếu tách ra và dùng 2 cái new HtmlWebpackPlugin thì: title, filename, template, chunks, description mỗi cái phải khác nhau
    // thông thường đầu vào bao nhiêu file thì phải dùng bấy nhiêu new HtmlWebpackPlugin
    new HtmlWebpackPlugin({
      // title của file .html mỗi khi npm run build tạo 1 bundle, .css, .html mới
      title: "Hello world index2",
      filename: "index2.html", // đầu ra tên file .html trong folder bundle, nếu đầu vào là 1 file thì k có 2 dòng: filename và chunks
      chunks: "index2", // tên chunks này phải giống với đầu vào ở trên
      // chunks: ['index'] // tên giống với name của entry
      // chunks: ['index2']  // tên giống với name của entry
      // đường dẫn chứa file .html mỗi khi npm run build tạo 1 bundle, .css, .html mới
      // filename: "subfolder/custom_filename.html",
      // nội dung file .html mỗi khi npm run build sẽ được tạo ra dựa vào mẫu templay này
      template: "src/index.hbs", // tên giống với name của entry
      // template: path.resolve(__dirname, "src/index.html") // tên giống với name của entry
      description: "Index2 description",
      // trường hợp đầu vào entry là 2 file trở lên, thì lệnh minify này giúp khai báo ra các: script, link css tương ứng với mỗi file
      // VD: đầu vào 2 file sẽ có 2 script và 2 link css
      minify: false,
      inject: true,
      // meta: {
      //   description: "Some description",
      // },
      // templateContent: `
      // <!DOCTYPE html>
      // <html>
      //   <head>
      //     <meta charset="utf-8" />
      //     <title>Hello world</title>
      //     <meta name="description" content="Some description" />
      //     <meta name="viewport" content="width=device-width,initial-scale=1" />
      //   </head>
      //   <body><div id="root"></div></body>
      // </html>
      // `,
    }),

    // Tách CSS thành các tệp riêng biệt
    new MiniCssExtractPlugin({
      // tên file .css sau khi tách ra khỏi bundle
      // filename: "styles.css", // -> thêm [contenthash] vào để mã hoá tên file bundle
      // filename: "styles.[contenthash].css", // -> thêm [contenthash] vào để mã hoá tên file style.css
      filename: "[name].[contenthash].css", // -> thêm [contenthash] vào để mã hoá tên file style.css
      chunkFilename: "[id].[contenthash].css",
      //   filename: "[name].css",
      // filename: 'styles.css'
    }),

    // ModuleFederationPlugin cho phép chia sẻ code giữa các ứng dụng hoặc các thành phần ứng dụng mà không cần tái build chúng, mở ra cơ hội cho kiến trúc microfrontend
    // new ModuleFederationPlugin({
    //   name: "app_name",
    //   library: { type: "var", name: "app_name" },
    //   filename: "remoteEntry.js",
    //   exposes: {
    //     "./Component": "./src/Component",
    //   },
    //   shared: require("./package.json").dependencies,
    // }),
    // new ModuleFederationPlugin({
    //   name: "HelloWorldApp",
    //   filename: "remoteEntry.js",
    //   exposes: {
    //     "./HelloWorldButton": "./src/Components/kiwi-page.js",
    //   },
    // }),

    // copy img folder assets vào folder dist
    // ẩn 'assetModuleFilename' ở trên mới hiện ra trong folder dist nha
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/assets/img/*"),
          to: path.resolve(__dirname, "dist"),
          context: "src",
        },
      ],
    }),

    // webpack-bundle-analyzer giúp bạn hiểu rõ hơn về cấu trúc của các bundle và các phụ thuộc, từ đó phát hiện các cơ hội tối ưu hóa kích thước bundle => là cái biểu đồ bữa anh Hùng cho xem sau khi build
    new BundleAnalyzerPlugin({}),

    new webpack.ProvidePlugin({
      mnt: "moment",
      $: "jquery",
    }),
    // remove css không dùng đến
    // giúp loại bỏ các style không sử dụng trong project như: tailwindCSS, giúp giảm kích thước của file CSS
    new PurgeCss({
      paths: glob.sync(`${purgePath.src}/**/*`, {
        nodir: true,
      }),
      // safelist: ["dummy-css"], // dùng khi mình muốn để lại 1 css mặc dù không dùng đến nhưng vẫn muốn để lại
    }),
  ],
};
