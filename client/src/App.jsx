import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import CreateEvent from "./CreateEvent";
import UpdateEvent from "./UpdateEvent";
import Event from "./Event";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Event />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/update/:id" element={<UpdateEvent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
