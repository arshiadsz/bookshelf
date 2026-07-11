import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import BookDetail from "./pages/BookDetail";
import CreateBook from "./pages/CreateBook";
import EditBook from "./pages/EditBook";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/books/:id/edit" element={<EditBook />} />
        <Route path="/create" element={<CreateBook />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}
