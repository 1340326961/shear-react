// import React from 'react';
// import { render } from 'react-dom';
// import ReactDemo from '../../src/index'; // 引入组件
// const App = () => <ReactDemo />;
// render(<App />, document.getElementById('root'));



import React from 'react'
import { render } from 'react-dom'
import ReactDemo from 'react_hujianrui_demo';
import 'react_hujianrui_demo/lib/main.min.css'; // ！需要引入样式！
console.log('123')
const App = () => <ReactDemo />;
render(<App />, document.getElementById('root'));
