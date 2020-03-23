import React, { Component } from "react";
import { fabric } from "fabric";
import { GlobalHotKeys } from "react-hotkeys";
import "./Toolbox.css";
import config from "./config";

const { SELECT, RECT, CIRCLE, LINE, ARROW, TEXT, ERASER, MAX_ZOOM, MIN_ZOOM, COLORS } = config;

let canvas = null;
window.fabric = fabric; // todo
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.strokeUniform = true;
fabric.Object.prototype.padding = 10;

const testJSON = `{"objects":[{"type":"path","version":"3.3.0","originX":"left","originY":"top","left":195.23,"top":189.98,"width":46.02,"height":73.04,"fill":null,"stroke":"black","strokeWidth":20,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"round","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"path":[["M",205.23,199.98],["Q",205.25,200,205.75,200.5],["Q",206.25,201,208.75,204],["Q",211.25,207,213.75,210],["Q",216.25,213,218.75,217],["Q",221.25,221,225.25,227.5],["Q",229.25,234,230.25,236],["Q",231.25,238,234.75,243.5],["Q",238.25,249,241.75,254],["Q",245.25,259,245.75,260.5],["Q",246.25,262,246.75,263.5],["Q",247.25,265,248.25,267],["Q",249.25,269,250.25,270.5],["Q",251.25,272,251.25,272.5],["L",251.25,273.02]]},{"type":"rect","version":"3.3.0","originX":"left","originY":"top","left":302.25,"top":327,"width":74,"height":55,"fill":"transparent","stroke":"black","strokeWidth":5,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0},{"type":"rect","version":"3.3.0","originX":"left","originY":"top","left":301.25,"top":206,"width":134,"height":82,"fill":"transparent","stroke":"red","strokeWidth":5,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0}]}`

const keyMap = {
  deleteNode: ["del", "backspace"],
  D: "d",
  V: "v",
  Add: "=",
  Subtract: "-"
};


class Toolbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: "draw",
      penSize: 20,
      penColor: config.COLORS[0],
      zoom: 1,
      hasSelected: false,
      history: []
    };
    this.drawingShape = null;
    this.canvas = null;
    window.drawboard = this
  }


  componentDidMount() {
    const { penSize, penColor } = this.state;
    this.initCanvas();
  }

  addImage = (url, opt = { selectable: false }) =>
    new Promise(resolve => {
      fabric.Image.fromURL(
        url,
        oImg => {
          this.canvas.add(oImg);
          canvas.add(oImg)
          canvas.requestRenderAll()
          resolve(oImg);
        },
        // bugfix: 图片跨域 https://stackoverflow.com/questions/50400183/fabricjs-tainted-canvases-may-not-be-exported-js-error-when-run-todataurl
        { ...opt, crossOrigin: 'anonymous' },
      );
    });

  addRect = ({ x, y }) => {
    const { penColor, penSize } = this.state;
    const rect = new fabric.Rect({
      left: x,
      top: y,
      fill: 'transparent',
      stroke: penColor,
      strokeWidth: penSize,
      width: 1,
      height: 1,
      selectable: false,
    });
    rect.startPos = [x, y];
    this.canvas.add(rect);
    return rect;
  };

  addEllipse = ({ x, y }) => {
    const { penColor, penSize } = this.state;
    const ellipse = new fabric.Ellipse({
      left: x,
      top: y,
      originX: 'left',
      originY: 'top',
      rx: 1,
      ry: 1,
      angle: 0,
      fill: 'transparent',
      stroke: penColor,
      strokeWidth: penSize,
      selectable: false,
    });
    ellipse.startPos = [x, y];
    this.canvas.add(ellipse);
    return ellipse;
  };

  // 获取鼠标在tranform后画布上的位置（拖拽画布会transform画布）
  getTransformPos = pointer =>
    Object.values(pointer).map(
      (val, idx) => (val - this.canvas.viewportTransform[idx + 4]) / this.canvas.getZoom(),
    );

  setType = type => {
    this.canvas.isDrawingMode = type === "draw";
    this.setState({
      type: type
    });
  };

  setPenSize = size => {
    this.canvas.freeDrawingBrush.width = size;
    this.setState({
      penSize: size
    });
  };

  bindEvent = () => {
    this.canvas.on('mouse:down:before', opt => {
      const { toolType } = this.props;
      if (toolType === SELECT && opt.e.ctrlKey) {
        // 拖拽画布前关闭所有object的选择/事件开关，避免触发
        this.setObjectsSelectable(false, false);
      }
    });

    this.canvas.on('mouse:down', opt => {
      const { toolType } = this.props;
      const curObject = opt.target;
      const curObjectType = curObject && curObject.get('type');
      const [x, y] = this.getTransformPos(opt.pointer);
      switch (toolType) {
        // 图形绘制
        case RECT:
          this.drawingShape = this.addRect({ x, y });
          break;
        case CIRCLE:
          this.drawingShape = this.addEllipse({ x, y });
          break;
        case LINE:
          this.drawingShape = this.addLine({ x, y });
          break;
        case ARROW:
          this.drawingShape = this.addLineArrow({ x, y });
          break;
        case TEXT: {
          if (!curObject || curObjectType !== 'i-text') {
            this.drawingShape = this.addText({ x, y });
          }
          if (curObject && curObjectType === 'i-text') {
            this.canvas.setActiveObject(curObject);
            curObject.enterEditing();
          }
          break;
        }
        case ERASER:
          if (curObject) {
            this.canvas.remove(curObject);
            this.canvas.clearContext(this.canvas.contextTop);
          }
          break;
        // 画布拖拽 ctrl + mousedrag
        case SELECT: {
          const evt = opt.e;
          if (evt.ctrlKey === true) {
            evt.preventDefault();
            // 设置鼠标样式
            this.canvas.setCursor('grabbing');
            this.canvas.hoverCursor = 'grabbing';
            this.canvas.isDragging = true;
            this.canvas.lastPosX = evt.clientX;
            this.canvas.lastPosY = evt.clientY;
          }
          break;
        }
        default:
          break;
      }
      this.canvas.requestRenderAll();
    });

    this.canvas.on('mouse:move', opt => {
      const { toolType } = this.props;
      const { pointer, e, target: curObject } = opt;
      // 更新正在绘制的图形
      if (this.drawingShape) {
        const [x, y] = this.getTransformPos(pointer);
        const [x0, y0] = this.drawingShape.startPos;
        switch (toolType) {
          case RECT: {
            let width = Math.max(Math.abs(x - x0), 1);
            let height = Math.max(Math.abs(y - y0), 1);
            let top = Math.min(y0, y);
            let left = Math.min(x0, x);
            // 锁定绘制正方形
            if (e.shiftKey === true) {
              width = Math.max(width, height);
              height = width;
              top = y0 - y > 0 ? Math.min(top, y0 - height) : top;
              left = x0 - x > 0 ? Math.min(left, x0 - width) : left;
            }
            this.drawingShape.set({
              width,
              height,
              left,
              top,
            });
            break;
          }
          case CIRCLE: {
            let rx = Math.max(Math.abs(x - x0) / 2, 1);
            let ry = Math.max(Math.abs(y - y0) / 2, 1);
            // 锁定绘制正圆
            if (e.shiftKey === true) {
              rx = Math.max(rx, ry);
              ry = rx;
            }
            this.drawingShape.set({
              rx,
              ry,
              left: Math.min(x0, x),
              top: Math.min(y0, y),
            });
            break;
          }
          case LINE:
          case ARROW: {
            this.drawingShape.set({
              x2: x,
              y2: y,
            });
            break;
          }
          default:
            break;
        }
        this.canvas.requestRenderAll();
      }
      // 画布拖拽
      if (this.canvas.isDragging) {
        this.canvas.viewportTransform[4] += e.clientX - this.canvas.lastPosX;
        this.canvas.viewportTransform[5] += e.clientY - this.canvas.lastPosY;
        this.canvas.requestRenderAll();
        this.canvas.lastPosX = e.clientX;
        this.canvas.lastPosY = e.clientY;
      }
      // 橡皮
      if (toolType === ERASER && curObject) {
        curObject._renderControls(this.canvas.contextTop, {
          hasControls: true, // 是否显示锚点
        });
      }
    });

    this.canvas.on('mouse:up', () => {
      const { toolType } = this.props;
      // 图形绘制
      if (this.drawingShape) {
        // 重新计算选择区, https://github.com/fabricjs/fabric.js/wiki/When-to-call-setCoords
        this.drawingShape.setCoords();
        this.drawingShape = null;
      }
      // 画布拖拽
      if (toolType === SELECT) {
        // 还原objects选择/事件开关
        this.setObjectsSelectable(true, true);
        this.canvas.isDragging = false;
      }
    });

    this.canvas.on('mouse:over', e => {
      const { toolType } = this.props;
      // 橡皮高亮
      if (toolType === ERASER && e.target) {
        e.target._renderControls(this.canvas.contextTop, {
          hasControls: true, // 是否显示锚点
        });
      }
    });

    this.canvas.on('mouse:out', () => {
      // 取消橡皮高亮
      if (this.props.toolType === ERASER) {
        this.canvas.clearContext(this.canvas.contextTop);
      }
    });

    // 滚轮缩放 ctrl + wheel
    this.canvas.on('mouse:wheel', opt => {
      const { deltaY, ctrlKey } = opt.e;
      if (this.props.toolType === SELECT && ctrlKey) {
        let zoom = this.canvas.getZoom();
        zoom += deltaY / 200;
        zoom = Math.max(Math.min(MAX_ZOOM, zoom), MIN_ZOOM);
        this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        this.props.setZoom(zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      }
    });
  };

  addPencil = () => {
    const { penColor, penSize } = this.state;
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    this.canvas.freeDrawingBrush.width = penSize;
    this.canvas.freeDrawingBrush.color = penColor;
  };

  initCanvas = () => {
    this.canvas = new fabric.Canvas("can", {
      isDrawingMode: true,
      hoverCursor: "pointer",
      stopContextMenu: true,
    });
    window.canvas = this.canvas;

    // this.bindEvent();
    this.addPencil();
    this.canvas.requestRenderAll();
  };

  getActiveClass(type) {
    return type === "draw" ? "activeType" : "";
  }

  handlers = {
    deleteNode() {
      const activeObjects = canvas.getActiveObjects();
      activeObjects.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    moveUp: event => console.log("Move up hotkey called!"),
    D: () => {
      this.setType("draw");
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    V: () => {
      this.setType("select");
    },
    Add() {
      canvas.setZoom(Math.min(MAX_ZOOM, canvas.getZoom() + 1));
    },
    Subtract() {
      canvas.setZoom(Math.max(1, canvas.getZoom() - 1));
    }
  };

  downloadImage = () => {
    var a = document.createElement("a"); //Create <a>
    a.href = this.canvas.toDataURL(); //Image Base64 Goes here
    a.download = "draw.png"; //File name Here
    a.click(); //Downloaded file
  }
  downloadJSON = () => {
    var a = document.createElement("a"); //Create <a>
    a.href = URL.createObjectURL(new Blob([JSON.stringify(this.canvas)])); //Image Base64 Goes here
    a.download = "draw.json"; //File name Here
    a.click(); //Downloaded file
  }

  render() {
    const {
      type,
      penSize,
      penColor,
      hasSelected,
      history
    } = this.state;
    return (
      <GlobalHotKeys handlers={this.handlers} keyMap={keyMap}>
        <div className="toolbox">
          <section>
            <h3>工具栏</h3>
            <button
              onClick={() => this.setType("rect")}
              className={type === "rect" ? "activeType" : ""}
            >
              矩形
            </button>
            <button
              onClick={() => this.setType("draw")}
              className={type === "draw" ? "activeType" : ""}
            >
              画笔
            </button>
            <button
              onClick={() => this.setType("select")}
              className={type === "select" ? "activeType" : ""}
            >
              选择
            </button>
            <button disabled={!hasSelected} onClick={this.deleteNodes}>
              删除
            </button>
            <button
              onClick={() => {
                canvas.getObjects().forEach(obj => canvas.remove(obj));
              }}
            >
              清空
            </button>
            <button
              disabled={history.length < 2}
              onClick={() => {
                if (history.length > 1) {
                  history.pop();
                  const cur = history[history.length - 1];
                  // 这个效果不好，loadbg要好久
                  canvas.loadFromJSON(cur);
                }
              }}
            >
              撤销
            </button>
            {type === "draw" && (
              <div className="subbox">
                <label>
                  <h4> 粗细：{penSize}</h4>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={penSize}
                    onChange={e => {
                      this.setPenSize(parseInt(e.target.value, 10));
                    }}
                  />
                </label>
              </div>
            )}
          </section>
          <h3> 颜色：</h3>
          <p>
            {config.COLORS.map(clr => (
              <span
                className={`corlorRadio ${penColor === clr ? "active" : ""}`}
                style={{ background: clr }}
                key={clr}
                onClick={() => {
                  canvas.freeDrawingBrush.color = clr;
                  this.setState({
                    penColor: clr
                  });
                }}
              />
            ))}
          </p>
          <h3>快捷键</h3>
          <ul>
            <li>删除: ["del", "backspace"] </li>
            <li> 画笔: "d" </li>
            <li> 选择: "v" </li>
            <li> 缩小: "-" </li>
            <li> 放大: "+" </li>
          </ul>
          <h3>JSON data： </h3>
          <button
            onClick={this.downloadJSON}
          >
            保存JSON
          </button>
          <button
            onClick={this.downloadImage}
          >
            保存PNG
          </button>

        </div>
      </GlobalHotKeys>
    );
  }
}

export default Toolbox;
