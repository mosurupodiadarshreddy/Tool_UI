import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

import Panel from "./pages/Panel";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/panel" element={<Panel />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;