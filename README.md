STEP1: npm init -y
STEP2: npm install webpack webpack-cli --save-dev
STEP3: npm i
STEP4: npm install --save-dev @babel/preset-react
STEP5: npm i react react-dom --save
STEP6: npm i react-router-dom
// babel-preset-react: hỗ trợ chuyển đổi JSX về Javascript
// npm i css-loader style-loader --save-dev: 2 thư viện này giúp webpack có thể tải file .css dưới dạng module

"scripts": {
"start": "webpack --mode development --watch",
"build": "webpack --mode production"
}

--hot: thay vì khi mình change nó sẽ load lại toàn bộ trang thì nó sẽ load lại những chỗ có sự thay đổi thôi
webpack serve: giúp tự động nạp lại trang browser mỗi khi lưu thay đổi (save change) mà không cần phải làm mới trang

// Development: không được minify (giảm size cho các file: js, css bằng cách loại bỏ các ký tự không cần thiết như: space, tab or các mã nguồn không dùng và không cần thiết. Khi file giảm size browser sẽ tải và load file nhanh hơn => tăng tốc độ tải trang or load page), không được tối ưu, dung lượng sẽ lớn hơn
// Production: được minify, tối ưu về dung lượng, nhẹ hơn giúp user load page nhanh hơn
// config webpack: webpack.dev.config.js là chính, sau đó xem nhưng config còn lại thấy dev thiếu gì lấy qua
