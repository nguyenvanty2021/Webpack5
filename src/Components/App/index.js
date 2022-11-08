import React from "react";
// import B from "../B";
import test from "./../../assets/img/test.png";
import "./index.scss";
import "./index1.css";
const App = () => {
  return (
    <div>
      <img src={test} />
      <div className="test">dassa</div>
      <div className="test1">dassa1</div>
      {/* <B /> */}
    </div>
  );
};
export default App;
