import React from "react";
// import B from "../B";
import test from "./../../assets/img/test.png";
import "./index.scss";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index1.css";
const A = () => {
  return (
    <div>
      <img src={test} />
      <div className="test">dassa</div>
      <div className="test1">dassa1</div>
      {/* <B /> */}
    </div>
  );
};
const B = () => {
  return <div>B</div>;
};
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<A />}></Route>
        <Route path="/b" element={<B />}></Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App;
