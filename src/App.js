import React from "react";

import Toolbox from './Toolbox'

function App() {

  return (
    <div>
      <canvas width="400" height="600" id="can" />
      <Toolbox></Toolbox>
    </div>
  );
}

export default React.memo(App);
