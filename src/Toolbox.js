import React, { Component } from "react";
import fabric from "./enhancedFabic";
import "./Toolbox.css";
import config from "./config";

const { TOOL_LIST, MAX_ZOOM, MIN_ZOOM, COLORS, LINE_WIDTH } = config;
const { SELECT, RECT, CIRCLE, LINE, ARROW, PENCIL, TEXT, ERASER } = TOOL_LIST

class Toolbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: PENCIL,
      penSize: 10,
      penColor: config.COLORS[0],
      zoom: 1,
    };
    this.drawingShape = null;
    this.canvas = null;
    window.drawboard = this
  }

  componentDidMount() {
    this.initCanvas();
  }

  componentDidUpdate(pp,ps) {
    const { type, penSize, penColor } = this.state
    const { type:preType } = ps
    this.canvas.isDrawingMode = type === 'pencil';
    this.canvas.freeDrawingBrush.width = penSize;
    this.canvas.freeDrawingBrush.color = penColor;
    if (
      preType !== type 
    ) {
      this.setObjectsSelectable(type === SELECT);
    }
  }

  addImage = (url, opt = { selectable: false }) =>
    new Promise(resolve => {
      fabric.Image.fromURL(
        url,
        oImg => {
          this.canvas.add(oImg)
          this.canvas.requestRenderAll()
          resolve(oImg)
        },
        // bugfix: 图片跨域 https://stackoverflow.com/questions/50400183/fabricjs-tainted-canvases-may-not-be-exported-js-error-when-run-todataurl
        { ...opt, crossOrigin: 'anonymous' },
      );
    });

  addRect = ({ x, y }) => {
    const { penColor } = this.state;
    const rect = new fabric.Rect({
      left: x,
      top: y,
      fill: 'transparent',
      stroke: penColor,
      strokeWidth: LINE_WIDTH,
      width: 1,
      height: 1,
      selectable: false,
    });
    rect.startPos = [x, y];
    this.canvas.add(rect);
    return rect;
  };

  addEllipse = ({ x, y }) => {
    const { penColor } = this.state;
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
      strokeWidth: LINE_WIDTH,
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

  // 设置全部可编辑obj的selectable和evented属性
  setObjectsSelectable = (selectable = false, evented = true) => {
    this.canvas.forEachObject(o => {
      o.selectable = selectable;
      o.evented = evented;
    });
  };

  bindEvent = () => {
    this.canvas.on('mouse:down:before', opt => {
      const { type } = this.state
      if (type === SELECT && opt.e.ctrlKey) {
        // 拖拽画布前关闭所有object的选择/事件开关，避免触发
        this.setObjectsSelectable(false, false);
      }
    });

    this.canvas.on('mouse:down', opt => {
      const { type } = this.state
      const curObject = opt.target;
      const curObjectType = curObject && curObject.get('type');
      const [x, y] = this.getTransformPos(opt.pointer);
      switch (type) {
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
      const { type } = this.state
      const { pointer, e, target: curObject } = opt;
      // 更新正在绘制的图形
      if (this.drawingShape) {
        const [x, y] = this.getTransformPos(pointer);
        const [x0, y0] = this.drawingShape.startPos;
        switch (type) {
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
      if (type === ERASER && curObject) {
        curObject._renderControls(this.canvas.contextTop, {
          hasControls: true, // 是否显示锚点
        });
      }
    });

    this.canvas.on('mouse:up', () => {
      const { type } = this.state
      // 图形绘制
      if (this.drawingShape) {
        // 重新计算选择区, https://github.com/fabricjs/fabric.js/wiki/When-to-call-setCoords
        this.drawingShape.setCoords();
        this.drawingShape = null;
      }
      // 画布拖拽
      if (type === SELECT) {
        // 还原objects选择/事件开关
        this.setObjectsSelectable(true, true);
        this.canvas.isDragging = false;
      }
    });

    this.canvas.on('mouse:over', e => {
      const { type } = this.state
      // 橡皮高亮
      if (type === ERASER && e.target) {
        e.target._renderControls(this.canvas.contextTop, {
          hasControls: true, // 是否显示锚点
        });
      }
    });

    this.canvas.on('mouse:out', () => {
      // 取消橡皮高亮
      if (this.state.type === ERASER) {
        this.canvas.clearContext(this.canvas.contextTop);
      }
    });

    // 滚轮缩放 ctrl + wheel
    this.canvas.on('mouse:wheel', opt => {
      const { deltaY, ctrlKey } = opt.e;
      if (ctrlKey) {
        let zoom = this.canvas.getZoom();
        zoom += deltaY / 200;
        zoom = Math.max(Math.min(MAX_ZOOM, zoom), MIN_ZOOM);
        this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
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
      selection: false,
      hoverCursor: "pointer",
      stopContextMenu: true,
    });
    window.canvas = this.canvas;

    this.bindEvent();
    this.addPencil();
    this.canvas.requestRenderAll();
  };

  getActiveClass(type) {
    return type === "draw" ? "activeType" : "";
  }

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
    } = this.state;
    return (
      <div className="toolbox">
        <section>
          <h3>Toolbox</h3>
          {Object.values(TOOL_LIST).map(tool => (
            <button
              key={tool}
              onClick={() => this.setState({ type: tool })}
              className={type === tool ? "activeType" : ""}
            >
              {tool}
            </button>
          ))}
          <button
            onClick={() => this.canvas.forEachObject(o => this.canvas.remove(o)).clearContext(this.canvas.contextTop).requestRenderAll()}
          >
            clear
            </button>
          <button
            onClick={() => {
              const objs = this.canvas.getObjects();
              if (objs.length) {
                const last = objs[this.canvas.getObjects().length - 1];
                if (last && !last.isStatic) {
                  this.canvas.remove(last);
                  this.canvas.renderAll();
                }
              }
            }}
          >
            undo add
            </button>
          <button
            onClick={this.downloadJSON}
          >
            save as JSON
            </button>
          <button
            onClick={this.downloadImage}
          >
            save as PNG
            </button>
          <div className="subbox">
            <label>
              <h4> Size:{penSize}</h4>
              <input
                type="range"
                min="1"
                max="100"
                value={penSize}
                onChange={e => {
                  this.setState({
                    penSize: parseInt(e.target.value, 10)
                  });
                }}
              />
            </label>
          </div>
        </section>
        <h4> Color: {penColor}</h4>
        <p>
          {COLORS.map(clr => (
            <span
              className={`corlorRadio ${penColor === clr ? "active" : ""}`}
              style={{ background: clr }}
              key={clr}
              onClick={() => {
                this.canvas.freeDrawingBrush.color = clr;
                this.setState({
                  penColor: clr
                });
              }}
            />
          ))}
        </p>
      </div>
    );
  }
}

export default Toolbox;
