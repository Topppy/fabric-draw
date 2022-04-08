import { fabric } from 'fabric';

// 删除control的icon
const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
const imgDelete = document.createElement('img');
imgDelete.src = deleteIcon;

// 删除control的handler
function deleteObjectHandler(eventData, target) {
  const { canvas } = target;
  canvas.remove(target);
  canvas.requestRenderAll();
}

// 删除control渲染方法
function renderDeleteIcon(ctx, left, top, styleOverride, fabricObject) {
  if (!this.getVisibility(fabricObject)) {
    return;
  }
  const size = this.cornerSize;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
  ctx.drawImage(imgDelete, -size / 2, -size / 2, size, size);
  ctx.restore();
}

// 自定义删除control
fabric.Object.prototype.controls.deleteControl = new fabric.Control({
  position: { x: 0.5, y: -0.5 },
  offsetY: 10,
  cursorStyle: 'pointer',
  // bugifx: actionHandler is not a function
  actionHandler: () => {},
  mouseUpHandler: deleteObjectHandler,
  render: renderDeleteIcon,
  cornerSize: 24,
});

// 自定义箭头
// Extended fabric line class
fabric.LineArrow = fabric.util.createClass(fabric.Line, {
  type: 'lineArrow',

  initialize(element, options = {}) {
    this.callSuper('initialize', element, options || {});
  },

  toObject() {
    return fabric.util.object.extend(this.callSuper('toObject'));
  },

  _render(ctx) {
    this.ctx = ctx;
    this.callSuper('_render', ctx);
    const p = this.calcLinePoints();
    const xDiff = this.x2 - this.x1;
    const yDiff = this.y2 - this.y1;
    const angle = Math.atan2(yDiff, xDiff);
    this.drawArrow(angle, p.x2, p.y2);
    ctx.save();
  },

  drawArrow(angle, xPos, yPos) {
    const arrowLen = 10;
    this.ctx.save();
    this.ctx.translate(xPos, yPos);
    this.ctx.rotate(angle);
    this.ctx.lineCap = 'round'; // 圆头
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-arrowLen, arrowLen);
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-arrowLen, -arrowLen);
    this.ctx.stroke();
    this.ctx.restore();
  },
});

fabric.LineArrow.fromObject = function fromObject(object, callback) {
  if (callback) {
    return callback(new fabric.LineArrow([object.x1, object.y1, object.x2, object.y2], object));
  }
  return false;
};

fabric.LineArrow.async = true;

// fabric.Object.prototype.strokeUniform = true;
// fabric.Object.prototype.padding = 10;

export default fabric;
