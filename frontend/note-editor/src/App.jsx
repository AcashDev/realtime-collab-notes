import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screen/home/Home";
import Login from "./screen/auth/Login";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import Header from "./components/Header";
import Layout from "./utils/Layout";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoutes />}>
            <Route element ={<Layout/>}>
            <Route path="/home" element={<Home />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
