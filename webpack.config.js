const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const PurgeCss = require("purgecss-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const glob = require("glob");
const purgePath = {
  src: path.join(__dirname, "src"),
};
// const { ModuleFederationPlugin } = require("webpack").container;
// const EsLintPlugin = require("eslint-webpack-plugin");
// file bundle này đầu vào 2 file, đầu ra 2 file (ở HtmlWebpack)
module.exports = {
  // entry: './src/index.js'
  entry: {
    // điểm bắt đầu
    // bundle: "./src/index.js", // Dẫn tới file index.js ta đã tạo
    // nếu dùng cách này có thể thêm nhiều điểm bắt đầu và gộp nó lại thành 1 file duy nhất là: bundle
    index: "./src/index.js",
    index2: "./src/index2.js",
    // muốn đầu vào nhiều file nhưng khi export ra file bundle chỉ có 1 file thôi thì dùng cách này
    // main: ["./src/index.js", "./src/index2.js"],
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
    publicPath: "", // vị trí file, img bắt đầu. VD: nếu tên img đóng gói xuất ra từ folder dist (nằm trong folder dist) tên là: dog.png thì khi đóng gói dường dẫn url img này trên web (khi click chuột phải vào ảnh) sẽ là: src="dist/dog.png"
    // nếu là publicPath: "https://image.com" -> thì img này khi đóng gói sẽ nằm trong folder dist vs url là: src="https://image.com/dog.png" (khi click chuột phải vào ảnh trên website)
    // or publicPath: 'http://localhost:9001/'
    // 4 dòng dưới có thể thay cho CleanWebpackPlugin (nếu không dùng CleanWebpackPlugin thì dùng 4 dòng này)
    // clean: {
    //   dry: true,
    //   keep: /\.css/,
    // },
    assetModuleFilename: "images/[hash][ext]",
    clean: true,
  },
  // đang code thì dùng development -> release dự án thì dùng production
  // hay nói cách khác mode:development có báo lỗi chi tiết ở file nào luôn chứ không phải ở file bundle, còn mode:production không có báo lỗi chi tiết
  mode: "development", // // lệnh này sẽ làm cho webpack thông báo lỗi sẽ đến từ file nào luôn chứ không để lỗi ở bundle nữa hoặc dùng devtool: 'inline-source-map',
  // optimization này giúp giảm dung lượng khi sử dụng thư viện thứ 3
  // VD: khi sử dung lodash, mỗi component khai báo 1 lần
  // nhiều compo khai báo như v sẽ rất năng
  // optimi sẽ giúp tạo ra 1 nơi chứa lodash trong folder bundle và các component tự gọi lodash
  // mà k cần phải khai báo ra -> giúp giảm dung lượng file
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 3000,
    },
  },
  devServer: {
    // thằng này chỉ dùng cho lệnh npm run build và npm run build-dev vì có serve
    // port: 9018,
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
    rules: [
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
      // tách file .css ra ngoài bundle.js
      {
        // test là tìm những file có đuôi là gì đó
        test: /\.css$/, // Sử dụng style-loader, css-loader cho file .css
        // tất cả các file .css sử dụng style-loader và css-loader
        // import 2 thằng này vào mới nhận được css import ở component
        // use: ["style-loader", "css-loader"],
        use: [
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
          MiniCssExtractPlugin.loader,
          "style-loader",
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: "asset/resource",
        parser: {
          dataUrlCondition: {
            maxSize: 3 * 1024, // img tối đa 3KB
          },
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
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: "asset/resource",
        parser: {
          dataUrlCondition: {
            maxSize: 3 * 1024, // img tối đa 3KB
          },
        },
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, // font ở đây
        type: "asset/inline",
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
    // new EsLintPlugin(),
    new TerserPlugin(),
    // packet này dùng để clean tất cả các file: .css, bundle cũ (không dùng đến nữa) trước khi npm run build để tạo ra 1 file .css và bundle mới
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
    new HtmlWebpackPlugin({
      // title của file .html mỗi khi npm run build tạo 1 bundle, .css, .html mới
      title: "Hello world index",
      filename: "index.html", // đầu ra tên file .html trong folder bundle, nếu đầu vào là 1 file thì k có 2 dòng: filename và chunks
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
    new MiniCssExtractPlugin({
      // tên file .css sau khi tách ra khỏi bundle
      // filename: "styles.css", // -> thêm [contenthash] vào để mã hoá tên file bundle
      // filename: "styles.[contenthash].css", // -> thêm [contenthash] vào để mã hoá tên file style.css
      filename: "[name].[contenthash].css", // -> thêm [contenthash] vào để mã hoá tên file style.css
      //   filename: "[name].css",
      // filename: 'styles.css'
    }),
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
    new BundleAnalyzerPlugin({}),
    new webpack.ProvidePlugin({
      mnt: "moment",
      $: "jquery",
    }),
    // remove css không dùng đến
    new PurgeCss({
      paths: glob.sync(`${purgePath.src}/**/*`, {
        nodir: true,
      }),
      // safelist: ["dummy-css"], // dùng khi mình muốn để lại 1 css mặc dù không dùng đến nhưng vẫn muốn để lại
    }),
  ],
};
