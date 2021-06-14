import React from 'react';
import Shear from '../../src/index';
const nv = require('./nv.jpg');
// import Shear from 'shear-react';
// import 'shear-react/lib/main.min.css';
import { render } from 'react-dom'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.Shear = React.createRef();
    this.state = {
      file: nv
    }
  }
  onChange = (img) =>{
    this.setState({img});
  }
  handleFileChange = (e) => {
    const files = e.target.files[0];
    var reader = new FileReader();
       reader.readAsDataURL(files);
       //操作完成
       reader.onload = () => {
        this.setState({
          file:reader.result
        })
       };
  }
  render() {
    const {onChange} = this;
    const { img,file } = this.state;
    return <div className="wode" style={{width: '1000px',margin:'0 auto'}}>
      <input id="file" onChange={this.handleFileChange} type="file"  name="file" multiple="multiple"></input>
      <button onClick={() =>this.Shear.current.cropImg()}>copy</button>
      <Shear aspectRatio={1} onChange={onChange} ref={this.Shear} width={1000} img={file} crossOrigin="anonymous"/>
      <img src={img} alt="图" />
    </div>
  }
}
render(<App />, document.getElementById('root'));
