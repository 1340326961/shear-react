import React from 'react';
// import Shear from '../../src/index';
const nv = require('./nv.jpg');
import Shear from 'shear-react';
import 'shear-react/lib/main.min.css';
import { render } from 'react-dom'

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
      <Shear aspectRatio={1} onChange={onChange} ref={this.Shear} width={1000} img={nv} crossOrigin="anonymous"/>
      <img src={img} alt="图" />
    </div>
  }
}
render(<App />, document.getElementById('root'));
