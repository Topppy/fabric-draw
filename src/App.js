import React from "react";
import Toolbox from "./Toolbox";

function App() {
  return (
    <div>
      <Toolbox />
      <canvas width="400" height="600" id="can" />
    </div>
  );
}

export default React.memo(App);
