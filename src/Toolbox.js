import React, { Component } from "react";
import { fabric } from "fabric";
import { GlobalHotKeys } from "react-hotkeys";
import "./Toolbox.css";

let canvas = null;
window.fabric = fabric; // todo
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.strokeUniform = true;
fabric.Object.prototype.padding = 10;
const MAX_ZOOM = 10

const keyMap = {
  deleteNode: ["del", "backspace"],
  D: "d",
  V: "v",
  Add: "=",
  Subtract: "-",
};

const COLORS_KEY = [
  "blue",
  "green",
  "yellow",
  "orange",
  "red",
  "black",
  "white"
];

const COLORS = COLORS_KEY.reduce((obj, curKey) => {
  obj[curKey] = curKey;
  return obj;
}, {});

// image
const addImage = url => {
  return new Promise(resolve => {
    fabric.Image.fromURL(url, oImg => {
      resolve(oImg);
    });
  });
};

const addBg = async url => {
  return new Promise(resolve => {
    canvas.setBackgroundImage(
      "http://www.gaozhongxue.com/uploads/allimg/190430/7-1Z430140324H7.jpg",
      () => {
        canvas.renderAll.bind(canvas)();
        resolve();
      }
    );
  });
};

// shape rect
const addRect = ({ color, x, y }) => {
  var rect = new fabric.Rect({
    left: x,
    top: y,
    fill: "transparent",
    stroke: color,
    strokeWidth: 5,
    width: 1,
    height: 1
  });
  canvas.add(rect);
  return rect;
};

// text
const addText = (text = "") => {
  var textObj = new fabric.Text(text, {
    left: 100,
    top: 200,
    fill: "blue",
    fontSize: 40
  });
  canvas.add(textObj);
};

// pencil
const addPencil = (width, color) => {
  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
  canvas.freeDrawingBrush.width = width;
  canvas.freeDrawingBrush.color = color;
};

class Toolbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonData: "",
      type: "draw",
      penSize: 20,
      penColor: COLORS.black,
      zoom: 1,
      hasSelected: false,
      history: []
    };
    this.drawingShape = null;
  }

  componentDidUpdate(pp, ps) {
    // console.log(ps.type, this.state.type)
    // if(this.state.type !== 'select') {
    //   canvas.discardActiveObject();
    // }
  }

  async componentDidMount() {
    const { penSize, penColor } = this.state;
    await this.initCanvas();
    addPencil(penSize, penColor);
  }

  setType = type => {
    canvas.isDrawingMode = type === "draw";
    this.setState({
      type: type
    });
  };

  setData = data => {
    this.setState(state => {
      const { history } = state;
      history.push(data);
      return {
        jsonData: data,
        history: history
      };
    });
  };

  setPenSize = size => {
    canvas.freeDrawingBrush.width = size;
    this.setState({
      penSize: size
    });
  };

  initCanvas = async setState => {
    canvas = new fabric.Canvas("can", {
      centeredScaling: true, // 中心缩放
      isDrawingMode: true,
      hoverCursor: "pointer"
    });
    window.canvas = canvas;
    await addBg();
    // 初始数据
    this.setData(JSON.stringify(canvas));

    // 选中
    canvas.on("selection:created", opt => {
      if (this.drawingShape) {
        canvas.discardActiveObject();
        return;
      }
      this.setState({ hasSelected: true, type: "select" });
    });
    // 无选中
    canvas.on("selection:cleared", opt => {
      this.setState({ hasSelected: false });
    });
    // mouse:down
    canvas.on("mouse:down", e => {
      const { type, penColor } = this.state;
      if (type === "rect") {
        const [x, y] = Object.values(e.pointer).map(
          val => val / canvas.getZoom()
        );
        this.drawingShape = addRect({
          color: penColor,
          x: x,
          y: y
        });
      }
    });
    canvas.on("mouse:move", e => {
      const { type } = this.state;
      if (type === "rect" && this.drawingShape) {
        const left = this.drawingShape.get("left");
        const top = this.drawingShape.get("top");
        const width = this.drawingShape.get("width");
        const height = this.drawingShape.get("height");
        const [x, y] = Object.values(e.pointer).map(
          val => val / canvas.getZoom()
        );
        this.drawingShape.set({
          width: x - left > 0 ? x - left : width + left - x,
          height: y - top > 0 ? y - top : height + top - y,
          left: x - left > 0 ? left : x,
          top: y - top > 0 ? top : y
        });
        canvas.requestRenderAll();
      }
    });

    canvas.on("mouse:up", e => {
      const { type } = this.state;
      // 更新数据
      this.setData(JSON.stringify(canvas));
      if (type === "rect" && this.drawingShape) {
        canvas.setActiveObject(this.drawingShape);
        canvas.discardActiveObject();
        // bugfix rect select error
        canvas.setZoom(canvas.getZoom());
        this.drawingShape = null;
      }
    });
  };

  getActiveClass(type) {
    return type === "draw" ? "activeType" : "";
  }

  handlers = {
    deleteNode() {
      canvas.discardActiveObject();
      const activeObjects = canvas.getActiveObjects();
      activeObjects.forEach(obj => canvas.remove(obj));
    },
    moveUp: event => console.log("Move up hotkey called!"),
    D() {
      this.setType("draw");
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    V() {
      this.setType("select");
    },
    Add() {
      canvas.setZoom(Math.min(MAX_ZOOM, canvas.getZoom() + 1))
    },
    Subtract(){
      canvas.setZoom(Math.max(1, canvas.getZoom() - 1))
    }
  };

  render() {
    const {
      jsonData,
      type,
      penSize,
      penColor,
      hasSelected,
      history
    } = this.state;
    return (
      <GlobalHotKeys handlers={this.handlers} keyMap={keyMap}>
        <a
          href={URL.createObjectURL(new Blob([jsonData]))}
          download="fabric.json"
        >
          保存JSON
        </a>
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
                this.setState({ jsonData: cur, history: history });
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
                大小：{penSize}
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
              <p>
                颜色：
                {Object.keys(COLORS).map(clr => (
                  <span
                    className={`corlorRadio ${
                      penColor === clr ? "active" : ""
                    }`}
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
            </div>
          )}
        </section>
        <h2>JSON data：</h2>
        <div className="data">{jsonData}</div>
      </GlobalHotKeys>
    );
  }
}

export default Toolbox;
