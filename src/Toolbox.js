import React, { Component } from "react";
import { fabric } from "fabric";
import "./Toolbox.css";

let canvas = null;
window.fabric = fabric; // todo
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerStyle = "circle";
fabric.Object.prototype.cornerSize = 6;

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
const addReact = () => {
  var rect = new fabric.Rect({
    left: 100,
    top: 300,
    fill: "transparent",
    stroke: "red",
    width: 20,
    height: 20,
    angle: 45
  });
  canvas.add(rect);
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

async function init(setData) {
  canvas = new fabric.Canvas("can", {
    centeredScaling: true, // 中心缩放
    isDrawingMode: true,
    hoverCursor: "pointer"
  });
  window.canvas = canvas;
  await addBg();
  // 初始数据
  setData(JSON.stringify(canvas));
  // 更新数据
  canvas.on("mouse:up", () => {
    setData(JSON.stringify(canvas));
    window.data = JSON.stringify(canvas);
  });
  // 缩放画布
  canvas.on("mouse:wheel", function(opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom = zoom + delta / 200;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.setZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonData: "",
      type: "draw",
      penSize: 20,
      penColor: COLORS.black,
      zoom: 1
    };
  }

  componentDidUpdate() {}

  async componentDidMount() {
    const { penSize, penColor } = this.state;
    await init(this.setData);
    addPencil(penSize, penColor);
  }

  setType = type => {
    canvas.isDrawingMode = type === "draw";
    this.setState({
      type: type
    });
  };

  setData = data => {
    this.setState({
      jsonData: data
    });
  };

  setPenSize = size => {
    canvas.freeDrawingBrush.width = size;
    this.setState({
      penSize: size
    });
  };
  render() {
    const { jsonData, type, penSize, penColor } = this.state;
    return (
      <div className="App">
        <a
          href={URL.createObjectURL(new Blob([jsonData]))}
          download="fabric.json"
        >
          保存JSON
        </a>
        <section>
          <h3>工具栏</h3>
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
          {type === "draw" && (
            <div className="subbox">
              <label>
                大小：{penSize}
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={penSize}
                  // class="slider"
                  onChange={e => {
                    this.setPenSize(parseInt(e.target.value, 10));
                  }}
                />
              </label>
              <p>
                颜色：<span className={penColor}>{penColor}</span>
                {}
              </p>
            </div>
          )}
        </section>
        <h2>JSON data：</h2>
        <div className="data">{jsonData}</div>
      </div>
    );
  }
}

export default React.memo(App);
