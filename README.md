# shear-react
--- 
![avatar](https://gimg2.baidu.com/image_search/src=http%3A%2F%2F2c.zol-img.com.cn%2Fproduct%2F124_500x2000%2F748%2FceZOdKgDAFsq2.jpg&refer=http%3A%2F%2F2c.zol-img.com.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1626303916&t=723fb08a844513e5890504e5cfedc025)

## 注意！！1.0.7版本之前的版本有bug不可用请使用1.0.7及之后的版本
## Installation
***
```
npm install --save shear-react
```
## Example
***
```javascript
import React from 'react';
import { render } from 'react-dom'
import Shear from 'shear-react';
const src = 'https://img0.baidu.com/it/u=3036316726,676055399&fm=26&fmt=auto&gp=0.jpg';
// 需要单独引入样式
import 'shear-react/lib/main.min.css';


class App extends React.Component {
  constructor(props) {
    super(props)
    this.Shear = React.createRef();
    this.state = {}
  }
  onChange = (img) =>{
    this.setState({img});
  }
  render() {
    const {onChange} = this;
    const { img } = this.state;
    return <div className="wode" style={{width: '1000px',margin:'0 auto'}}>
      <button onClick={() =>this.Shear.current.cropImg()}>copy</button>
      <Shear cropBoxColor="green" aspectRatio={16/9} onChange={onChange} ref={this.Shear} width={1000} img={src} crossOrigin="anonymous"/>
      <img src={img} alt="图" />
    </div>
  }
}
render(<App />, document.getElementById('root'));
```

## Options
***
### img

 - Type: string
 - Default: null

图片链接

### cropBoxColor
 - Type: string
 - Default: hotpink

裁剪框颜色
### aspectRatio
 - Type: number
 - Default: offsetWidth/offsetHeight

裁剪框的宽高比，默认图片的宽度/图片的高度

### onChange
 - Type: (imgBase64: srting) : void
 - Default: () => {}

裁剪的回调裁剪后的图片（base64）
### width
 - Type: string
 - Default: 100%
 
工作区域的宽 默认100%
### height
 - Type: string
 - Default: auto
 
工作区域的高 默认自适应
### crossOrigin
 - Type: string
 - Default: undefined
 - [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/crossOrigin)
 - Options：
 	- anonymous
 	- use-credentials

img标签的 crossOrigin属性，
注： 图片跨域时需要设置否则裁剪失败（设置crossorigin 的前提是服务端允许你跨域获取图片，不允许设置了corssOrigin也没用）
### ref

 - 用ref触发cropImg方法触发裁剪操作




github：https://github.com/1340326961/shear-react

本人小菜鸡，自己写着玩，有一些瑕疵但是不影响大致使用，想加什么功能或者在什么节点上想暴露出哪些信息或者出现了什么bug，可以在github上提bug（请写中文我英语不好），还望大佬们多多指教优化代码
