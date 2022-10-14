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