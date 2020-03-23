import React from "react";
import Toolbox from "./Toolbox";
import './App.css'

function App() {
  return (
    <div className="App" >
      <Toolbox />
      <div className="canContainer">
        <canvas width="900" height="900" id="can" />
      </div>
    </div>
  );
}

export default React.memo(App);
