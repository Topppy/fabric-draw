import React from "react";
import Toolbox from "./Toolbox";
import './App.css'

function App() {
  return (
    <div className="App">
      <Toolbox />
      <canvas width="900" height="1200" id="can" />
    </div>
  );
}

export default React.memo(App);
