(window["webpackJsonpfabric-draw"]=window["webpackJsonpfabric-draw"]||[]).push([[0],{14:function(e,t,n){e.exports=n(34)},19:function(e,t,n){},26:function(e,t){},27:function(e,t){},28:function(e,t){},32:function(e,t,n){},33:function(e,t,n){},34:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),o=n(7),c=n.n(o),i=(n(19),n(5)),s=n(8),l=n(9),u=n(12),d=n(10),p=n(13),f=n(3),h=n.n(f),m=n(4),w=n(2),b=n(11),v=(n(32),null);window.fabric=w.fabric,w.fabric.Object.prototype.transparentCorners=!1,w.fabric.Object.prototype.strokeUniform=!0,w.fabric.Object.prototype.padding=10;var g=10,y={deleteNode:["del","backspace"],D:"d",V:"v",Add:"=",Subtract:"-"},S=["blue","green","yellow","orange","red","black","white"].reduce(function(e,t){return e[t]=t,e},{}),j=function(){var e=Object(m.a)(h.a.mark(function e(t){return h.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise(function(e){v.setBackgroundImage("http://www.gaozhongxue.com/uploads/allimg/190430/7-1Z430140324H7.jpg",function(){v.renderAll.bind(v)(),e()})}));case 1:case"end":return e.stop()}},e)}));return function(t){return e.apply(this,arguments)}}(),k=function(e){var t=e.color,n=e.x,a=e.y,r=new w.fabric.Rect({left:n,top:a,fill:"transparent",stroke:t,strokeWidth:5,width:1,height:1});return v.add(r),r},O=function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(u.a)(this,Object(d.a)(t).call(this,e))).setType=function(e){v.isDrawingMode="draw"===e,n.setState({type:e})},n.setData=function(e){n.setState(function(t){var n=t.history;return n.push(e),{jsonData:e,history:n}})},n.setPenSize=function(e){v.freeDrawingBrush.width=e,n.setState({penSize:e})},n.initCanvas=function(){var e=Object(m.a)(h.a.mark(function e(t){return h.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return v=new w.fabric.Canvas("can",{centeredScaling:!0,isDrawingMode:!0,hoverCursor:"pointer"}),window.canvas=v,e.next=4,j();case 4:n.setData(JSON.stringify(v)),v.on("selection:created",function(e){n.drawingShape?v.discardActiveObject():n.setState({hasSelected:!0,type:"select"})}),v.on("selection:cleared",function(e){n.setState({hasSelected:!1})}),v.on("mouse:down",function(e){var t=n.state,a=t.type,r=t.penColor;if("rect"===a){var o=Object.values(e.pointer).map(function(e){return e/v.getZoom()}),c=Object(i.a)(o,2),s=c[0],l=c[1];n.drawingShape=k({color:r,x:s,y:l})}}),v.on("mouse:move",function(e){if("rect"===n.state.type&&n.drawingShape){var t=n.drawingShape.get("left"),a=n.drawingShape.get("top"),r=n.drawingShape.get("width"),o=n.drawingShape.get("height"),c=Object.values(e.pointer).map(function(e){return e/v.getZoom()}),s=Object(i.a)(c,2),l=s[0],u=s[1];n.drawingShape.set({width:l-t>0?l-t:r+t-l,height:u-a>0?u-a:o+a-u,left:l-t>0?t:l,top:u-a>0?a:u}),v.requestRenderAll()}}),v.on("mouse:up",function(e){var t=n.state.type;n.setData(JSON.stringify(v)),"rect"===t&&n.drawingShape&&(v.setActiveObject(n.drawingShape),v.discardActiveObject(),v.setZoom(v.getZoom()),n.drawingShape=null)});case 10:case"end":return e.stop()}},e)}));return function(t){return e.apply(this,arguments)}}(),n.handlers={deleteNode:function(){v.getActiveObjects().forEach(function(e){return v.remove(e)}),v.discardActiveObject(),v.renderAll()},moveUp:function(e){return console.log("Move up hotkey called!")},D:function(){this.setType("draw"),v.discardActiveObject(),v.renderAll()},V:function(){this.setType("select")},Add:function(){v.setZoom(Math.min(g,v.getZoom()+1))},Subtract:function(){v.setZoom(Math.max(1,v.getZoom()-1))}},n.state={jsonData:"",type:"draw",penSize:20,penColor:S.black,zoom:1,hasSelected:!1,history:[]},n.drawingShape=null,n}return Object(p.a)(t,e),Object(l.a)(t,[{key:"componentDidUpdate",value:function(e,t){}},{key:"componentDidMount",value:function(){var e=Object(m.a)(h.a.mark(function e(){var t,n,a;return h.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t=this.state,n=t.penSize,a=t.penColor,e.next=3,this.initCanvas();case 3:r=n,o=a,v.freeDrawingBrush=new w.fabric.PencilBrush(v),v.freeDrawingBrush.width=r,v.freeDrawingBrush.color=o;case 4:case"end":return e.stop()}var r,o},e,this)}));return function(){return e.apply(this,arguments)}}()},{key:"getActiveClass",value:function(e){return"draw"===e?"activeType":""}},{key:"render",value:function(){var e=this,t=this.state,n=t.jsonData,a=t.type,o=t.penSize,c=t.penColor,i=t.hasSelected,s=t.history;return r.a.createElement(b.GlobalHotKeys,{handlers:this.handlers,keyMap:y},r.a.createElement("div",{className:"toolbox"},r.a.createElement("section",null,r.a.createElement("h3",null,"\u5de5\u5177\u680f"),r.a.createElement("button",{onClick:function(){return e.setType("rect")},className:"rect"===a?"activeType":""},"\u77e9\u5f62"),r.a.createElement("button",{onClick:function(){return e.setType("draw")},className:"draw"===a?"activeType":""},"\u753b\u7b14"),r.a.createElement("button",{onClick:function(){return e.setType("select")},className:"select"===a?"activeType":""},"\u9009\u62e9"),r.a.createElement("button",{disabled:!i,onClick:this.deleteNodes},"\u5220\u9664"),r.a.createElement("button",{onClick:function(){v.getObjects().forEach(function(e){return v.remove(e)})}},"\u6e05\u7a7a"),r.a.createElement("button",{disabled:s.length<2,onClick:function(){if(s.length>1){s.pop();var t=s[s.length-1];e.setState({jsonData:t,history:s}),v.loadFromJSON(t)}}},"\u64a4\u9500"),"draw"===a&&r.a.createElement("div",{className:"subbox"},r.a.createElement("label",null,r.a.createElement("h4",null," \u5927\u5c0f\uff1a",o),r.a.createElement("input",{type:"range",min:"1",max:"100",value:o,onChange:function(t){e.setPenSize(parseInt(t.target.value,10))}})))),r.a.createElement("h3",null," \u989c\u8272\uff1a"),r.a.createElement("p",null,Object.keys(S).map(function(t){return r.a.createElement("span",{className:"corlorRadio ".concat(c===t?"active":""),style:{background:t},key:t,onClick:function(){v.freeDrawingBrush.color=t,e.setState({penColor:t})}})})),r.a.createElement("h3",null,"JSON data\uff1a"," "),r.a.createElement("a",{href:URL.createObjectURL(new Blob([n])),download:"fabric.json"},"\u4fdd\u5b58JSON"),r.a.createElement("div",{className:"data"},n)))}}]),t}(a.Component);n(33);var E=r.a.memo(function(){return r.a.createElement("div",{className:"App"},r.a.createElement(O,null),r.a.createElement("canvas",{width:"900",height:"1200",id:"can"}))});Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(r.a.createElement(E,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[14,1,2]]]);
//# sourceMappingURL=main.18657e14.chunk.js.map