import React from 'react';
import { evaluate } from 'mathjs';
import './index.css';

const oppositeDirection = {
  left_top: 'right_bottom',
  center_top: 'center_bottom',
  right_top: 'left_bottom',
  right_center: 'left_center',
  right_bottom: 'left_top',
  center_bottom: 'center_top',
  left_bottom: 'right_top',
  left_center: 'right_center',
}
class Shear extends React.Component {
  constructor (props) {
    super(props);
    this.canvasBox = React.createRef();
    this.moveBox = React.createRef();
    this.activeImg = React.createRef();
    this.state ={
      img:null,
      transformX: 0,
      transformY: 0,
      cropBoxWidth: 0,
      cropBoxHeight: 0,
      imgW: 0,
      imgH: 0,
      imgInfo:null,
      aspectRatio :props.aspectRatio,
    }
  }
  readMove = false;
  readSpotMove = false;
  mouseDownX = 0;
  mouseDownY = 0;
  cropBoxInfo = null;
  workAreaInfo = null;
  spotPosition = null;
  createMoveBox = false;
  static defaultProps = {
    img: null,
    aspectRatio: null,
    crossOrigin: false,
    width: '100%',
    height: 'auto',
    onChange: () =>{},
    cropBoxColor:'hotpink'
  }
  createBoxClient = {
    x: 0,
    y: 0
  }
  componentDidMount() {
    this.init();
  }
  init = () => {
    let {aspectRatio} = this.state;
    const {img} = this.props;
    if (!img) return
    window.onload = () => {
      const { current } = this.activeImg;
      const {naturalWidth, naturalHeight, offsetWidth, offsetHeight} = current;
      const shortSide = offsetWidth > offsetHeight ? offsetHeight : offsetWidth;
      if (!aspectRatio) {
        aspectRatio = evaluate(`${offsetWidth}/${offsetHeight}`)
      }
      this.setState({
        cropBoxWidth: evaluate(`${shortSide} / 2`),
        cropBoxHeight: evaluate(`${shortSide} / 2 / ${aspectRatio}`),
        imgInfo : {
          width: naturalWidth,
          height: naturalHeight,
          width_style: offsetWidth,
          height_style: offsetHeight,
        },
        aspectRatio
      },() => {
        this.cropBoxInfo = this.moveBox.current.getBoundingClientRect();
        this.workAreaInfo = this.canvasBox.current.getBoundingClientRect();
        const {cropBoxWidth,cropBoxHeight} = this.state;
        this.setState({
          imgW: cropBoxWidth,
          imgH: cropBoxHeight,
          transformX:evaluate(`${this.workAreaInfo.width} / 2 - ${cropBoxWidth} /2`),
          transformY:evaluate(`${this.workAreaInfo.height} / 2 -${cropBoxHeight} / 2`),
        })
      })
    }
  }
  boxDown = (e) => {
    e.preventDefault();
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    this.mouseDownX = offsetX;
    this.mouseDownY = offsetY;
    this.cropBoxInfo = rect;
    this.readMove = true;
    this.workAreaInfo = this.canvasBox.current.getBoundingClientRect();
    console.log(this.workAreaInfo.top)
    window.addEventListener('mousemove',this.boxMove);
    window.addEventListener('mouseup',this.boxUp);
  }
  boxUp = () => {
    this.readMove = false;
    window.removeEventListener('mousemove', this.boxMove);
    window.removeEventListener('mouseup', this.boxUp);
  }
  boxMove = (e) => {
    if (!this.readMove) return;
    const {clientX, clientY} = e;
    const { cropBoxInfo,workAreaInfo } = this;
    let transformX = evaluate(`${clientX} - ${workAreaInfo.left} - ${this.mouseDownX}`);
    let transformY = evaluate(`${clientY} - ${workAreaInfo.top} - ${this.mouseDownY}`);
    if (evaluate(`${clientX}-${this.mouseDownX}`) < workAreaInfo.left) transformX = '0';
    if (evaluate(`${clientX}-${this.mouseDownX} + ${cropBoxInfo.width}`) > workAreaInfo.right) transformX = evaluate(`${workAreaInfo.width}-${cropBoxInfo.width}`)
    if (evaluate(`${clientY}-${this.mouseDownY}`) < workAreaInfo.top) transformY = '0';
    if (evaluate(`${clientY}-${this.mouseDownY} + ${cropBoxInfo.height}`) > workAreaInfo.bottom) transformY = evaluate(`${workAreaInfo.height}-${cropBoxInfo.height}`)
    this.setState({transformX,transformY})
  }
  cropImg = () => {
    const {transformX,transformY} = this.state;
    const {width:imgW, height:imgH, width_style:imgWS, height_style:imgHS} = this.state.imgInfo;
    const { width:cropW,height:cropH } = this.cropBoxInfo;
    const { onChange } = this.props;
    const proportion_w = evaluate(`(${cropW} / ${imgWS})`);
    const proportion_h = evaluate(`(${cropH} / ${imgHS})`);
    const proportion_x = evaluate(`(${transformX} / ${imgWS})`);
    const proportion_y = evaluate(`(${transformY} / ${imgHS})`);

    const canvasW = evaluate(`${imgW} * ${proportion_w}`);
    const canvasH = evaluate(`${imgH} * ${proportion_h}`);
    const sx = evaluate(`${imgW} * ${proportion_x}`);
    const sy = evaluate(`${imgH} * ${proportion_y}`);

    const canvas = document.createElement("canvas");
    canvas.width =canvasW;
    canvas.height =canvasH;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.activeImg.current, sx, sy, canvasW,canvasH,0,0, canvasW, canvasH);
    const res = canvas.toDataURL('image/jpeg');
    this.setState({img:res});
    onChange(res)
    return res
  }
  spotDown =(e,position) => {
    e.stopPropagation();
    e.preventDefault();
    this.readSpotMove = true;
    this.spotPosition = position;
    this.workAreaInfo = this.canvasBox.current.getBoundingClientRect();
    window.addEventListener('mousemove',this.spotMove);
    window.addEventListener('mouseup',this.spotUp);
  }
  // 裁剪框缩放(都是按比例缩放的)
  spotMove = (e) => {
    if (!this.readSpotMove) return
    const {aspectRatio} = this.state;
    let {cropBoxWidth, cropBoxHeight,transformX, transformY,} = this.state;
    const {clientX, clientY} = e;
    this.workAreaInfo = this.canvasBox.current.getBoundingClientRect();
    const { spotPosition, workAreaInfo} = this;
    let movedH = 0;
    let movedW = 0;
    let movedY = 0;
    let movedX = 0;
    let cropBoxW = 0;
    let cropBoxH = 0;
    let noCheckBottom = false;
    let noCheckTop = false;
    let noCheckLeft = false;
    let noCheckRight = false;
    // eslint-disable-next-line default-case
    switch (spotPosition) {
      case 'center_top':
        // center_top 中上点 特征 => 1.底线不动， 2. 以底部中点为中心点进行缩放

        // 移动的高度 = 裁剪框的Y轴（对于工作区）-鼠标的Y轴（对于窗口） + 工作区的Y轴 （裁剪框调整前的Y - 裁剪框调整后的Y）
        movedH = evaluate(`${transformY} - ${clientY} + ${workAreaInfo.top}`);
        // 移动的宽度 = 移动高度 * 比例
        movedW = evaluate(`${movedH} * ${aspectRatio}`);
        // 移动后的左上角Y轴坐标 = 当前Y轴坐标 - 移动的高度
        movedY = evaluate(`${transformY} - ${movedH}`);
        // 移动后的左上角X轴坐标 = 当前X轴坐标 - 移动的宽度 / 2 (/2 是为了宽度两边都扩张)
        movedX = evaluate(`${transformX} - ${movedW} / ${2}`);

        cropBoxH = evaluate(`${cropBoxHeight} + ${movedH}`);
        cropBoxW = evaluate(`${cropBoxH} * ${aspectRatio}`);
        noCheckBottom = true;
        break;
      case 'center_bottom':
        // center_bottom 中下点 特征 => 1.顶线不动， 2. 以顶部中点为中心点进行缩放

        // 移动的高度 = 鼠标的Y轴（对于窗口）- 工作区的Y轴 -  裁剪框的Y轴（对于工作区）- 裁剪框的高度
        movedH = evaluate(`${clientY} - ${workAreaInfo.top} - ${transformY} - ${cropBoxHeight}`);
        // 移动的宽度 = 移动高度 * 比例
        movedW = evaluate(`${movedH} * ${aspectRatio}`);
        movedY = transformY;
        movedX = evaluate(`${transformX} - ${movedW} / ${2}`);
        cropBoxH = evaluate(`${cropBoxHeight} + ${movedH}`);
        cropBoxW = evaluate(`${cropBoxH} * ${aspectRatio}`);
        noCheckTop = true;
        break;

      case 'right_center':
        // right_center 右侧中心点 特征 => 左侧线不动 2. 以左侧中心点为中心缩放
        movedW = evaluate(`${clientX} - ${workAreaInfo.left} - ${transformX} - ${cropBoxWidth}`);
        movedH = evaluate(`${movedW} / ${aspectRatio}`);
        movedY = evaluate(`${transformY} - ${movedH} / ${2}`);
        movedX = transformX;
        cropBoxW = evaluate(`${cropBoxWidth} + ${movedW}`);
        cropBoxH = evaluate(`${cropBoxW} / ${aspectRatio}`);
        noCheckLeft = true;
        break;

      case 'left_center':
        // right_center 左侧中心点 特征 => 右侧线不动 2. 以右侧中心点为中心缩放
        movedW = evaluate(`${transformX} - ${clientX} + ${workAreaInfo.left}`);
        movedH = evaluate(`${movedW} / ${aspectRatio}`);
        movedY = evaluate(`${transformY} - ${movedH} / ${2}`);
        movedX = evaluate(`${transformX} - ${movedW}`);;
        cropBoxW = evaluate(`${cropBoxWidth} + ${movedW}`);
        cropBoxH = evaluate(`${cropBoxW} / ${aspectRatio}`);
        noCheckRight = true;
        break;

      case 'left_top':
        movedW = evaluate(`${transformX} - ${clientX} + ${workAreaInfo.left}`);
        movedH = evaluate(`${movedW} / ${aspectRatio}`);
        movedY = evaluate(`${transformY} - ${movedH}`);
        movedX = evaluate(`${transformX} - ${movedW}`);
        cropBoxW = evaluate(`${cropBoxWidth} + ${movedW}`);
        cropBoxH = evaluate(`${cropBoxW} / ${aspectRatio}`);
        noCheckBottom = true;
        noCheckRight = true;
        break;

      case 'right_top':
        movedW = evaluate(`${clientX} - ${transformX} - ${workAreaInfo.left} - ${cropBoxWidth}`);
        movedH = evaluate(`${movedW} / ${aspectRatio}`);
        movedY = evaluate(`${transformY} - ${movedH}`);
        movedX = transformX;
        cropBoxW = evaluate(`${cropBoxWidth} + ${movedW}`);
        cropBoxH = evaluate(`${cropBoxW} / ${aspectRatio}`);
        noCheckBottom = true;
        noCheckLeft = true;
        break;

      case 'right_bottom':
        movedW = evaluate(`${clientX} - ${transformX} - ${workAreaInfo.left} - ${cropBoxWidth}`);
        movedH = evaluate(`${movedW} / ${aspectRatio}`);
        movedY = transformY;
        movedX = transformX;
        cropBoxW = evaluate(`${cropBoxWidth} + ${movedW}`);
        cropBoxH = evaluate(`${cropBoxW} / ${aspectRatio}`);
        noCheckTop = true;
        noCheckLeft = true;
        break;

      case 'left_bottom':
        movedW = evaluate(`${transformX} + ${workAreaInfo.left} - ${clientX}`);
        movedH = evaluate(`${movedW} / ${aspectRatio}`);
        movedY = transformY;
        movedX = evaluate(`${transformX} - ${movedW}`);
        cropBoxW = evaluate(`${cropBoxWidth} + ${movedW}`);
        cropBoxH = evaluate(`${cropBoxW} / ${aspectRatio}`);
        noCheckTop = true;
        noCheckRight = true;
        break;
    }
    // 不可以超出工作区
    const overflowY = evaluate(`${movedY} + ${cropBoxH} + ${workAreaInfo.top}`) >= workAreaInfo.bottom;
    const overflowX = evaluate(`${movedX} + ${cropBoxW} + ${workAreaInfo.left}`) >= workAreaInfo.right;
    if ((movedY <= 0 && !noCheckTop) ||( movedX <= 0 && !noCheckLeft) || (overflowY && !noCheckBottom) || (overflowX && !noCheckRight)) return;
    if (cropBoxW <=0 || cropBoxH <=0) this.spotPosition = oppositeDirection[this.spotPosition]
    this.setState({
      cropBoxWidth: cropBoxW,
      cropBoxHeight: cropBoxH,
      transformX: movedX,
      transformY: movedY,
    })
  }
  spotUp = () => {
    this.readSpotMove = false;
    this.cropBoxInfo = this.moveBox.current.getBoundingClientRect();
    window.removeEventListener('mousemove', this.spotMove);
    window.removeEventListener('mouseup', this.spotUp);
  }
  workAreaMouseDown =(e) => {
    e.stopPropagation();
    e.preventDefault();
    this.createMoveBox = true;
    this.readSpotMove = true;
    const {clientX, clientY} = e;
    this.workAreaInfo = this.canvasBox.current.getBoundingClientRect();
    this.createBoxClient = {
      x:clientX,
      y:clientY,
    }
    window.addEventListener('mousemove',this.workAreaMouseMove)
    window.addEventListener('mouseup',this.createMoveBoxOver)
  }
  workAreaMouseMove = (e) => {
      const {x, y} = this.createBoxClient;
      const { clientX,clientY } = e;
      if (Math.abs(x - clientY) < 10 || Math.abs(y - clientY) < 10) return
      if (this.createMoveBox) {
        if (x < clientX) {
          if (y > clientY) {
            this.spotPosition = 'right_top';
          }else {
            this.spotPosition = 'right_bottom';
          }
        }
        if (x > clientX) {
          if (y < clientY) {
            this.spotPosition = 'left_bottom';
          }else {
            this.spotPosition = 'left_top';
          }
        }
        this.setState({
          cropBoxHeight: Math.abs(evaluate(`${x} - ${clientX}`)),
          cropBoxWidth: Math.abs(evaluate(`${y} - ${clientY}`)),
          transformX:evaluate(`${x} - ${this.workAreaInfo.left}`),
          transformY:evaluate(`${y} - ${this.workAreaInfo.top}`),
        },() => this.spotMove(e))
      }else {
        this.spotMove(e);
      }
      if (this.createMoveBox) this.createMoveBox = false;
  }
  createMoveBoxOver = () =>{
    this.createBoxClient = null;
    this.readSpotMove = false;
    window.removeEventListener('mousemove',this.workAreaMouseMove)
    window.removeEventListener('mouseup',this.createMoveBoxOver)
  }
  render() {
    const {transformX,transformY,cropBoxHeight,cropBoxWidth,imgInfo,imgW,imgH,} = this.state;
    const {img, crossOrigin,width, height,cropBoxColor} = this.props;
    if (!img) return <div>请传入图片链接</div>
    return (
        <div className="App" style={{width, height}}>
          <div className="canvas_box" ref={this.canvasBox} onMouseDown={this.workAreaMouseDown}>
            {crossOrigin ? (
              // use-credentials
              <img ref={this.activeImg} crossOrigin={crossOrigin} className="canvas" src={img} alt="图片"/>
              ): (
                <img ref={this.activeImg}  className="canvas" src={img} alt="图片"/>
              )}
            <div className="modal"></div>
            {imgInfo ? (
                <div ref={this.moveBox} style={{width:cropBoxWidth, height:cropBoxHeight ,transform: `translate(${transformX}px,${transformY}px)`}} className="move_box" onMouseDown={this.boxDown}>
                  <div className="move_img_box">
                    <img alt="图片" style={{width: imgInfo.width_style,height: imgInfo.height_style,transform: `translate(-${transformX}px,-${transformY}px)`}} src={img}/>
                  </div>
                  <div style={{backgroundColor:cropBoxColor}} className="line_top line" onMouseDown={(e) => this.spotDown(e,'center_top')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="line_right line" onMouseDown={(e) => this.spotDown(e,'right_center')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="line_bottom line" onMouseDown={(e) => this.spotDown(e,'center_bottom')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="line_left line" onMouseDown={(e) => this.spotDown(e,'left_center')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="spot spot_left_top" onMouseDown={(e) => this.spotDown(e,'left_top')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="spot spot_center_top" onMouseDown={(e) => this.spotDown(e,'center_top')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="spot spot_right_top" onMouseDown={(e) => this.spotDown(e,'right_top')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="spot spot_right_center" onMouseDown={(e) => this.spotDown(e,'right_center')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="spot spot_right_bottom" onMouseDown={(e) => this.spotDown(e,'right_bottom')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="spot spot_center_bottom" onMouseDown={(e) => this.spotDown(e,'center_bottom')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="spot spot_left_bottom" onMouseDown={(e) => this.spotDown(e,'left_bottom')}></div>
                  <div style={{backgroundColor:cropBoxColor}} className="spot spot_left_center" onMouseDown={(e) => this.spotDown(e,'left_center')}></div>
                </div>
            ): null}
          </div>
          {/* < img src={this.state.img} alt="裁剪后的" style={{width:imgW, height:imgH}} /> */}
          {/* {imgInfo ? (
              <div style={{display:'flex'}}>
                <div style={{width:imgW, height:imgH,overflow:'hidden'}}>
                  < img alt="图片" style={{
                    width:evaluate(`${imgInfo.width_style} / ${cropBoxWidth} * ${imgW}`),
                    height:evaluate(`${imgInfo.height_style} / ${cropBoxHeight} * ${imgH}`),
                    transform: `translate(-${evaluate(`${imgW} / ${cropBoxWidth} * ${transformX}`)}px,-${evaluate(`${imgH} / ${cropBoxHeight} * ${transformY}`)}px)`}} src={img}
                  />
                </div>
              </div>
          ): null} */}
        </div>
    );
  }
}

export default Shear;