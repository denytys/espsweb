import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import Home from "./Home";
import Dashboard from "./pages/Dashboard";
import IncomingCertificate from "./pages/IncomingCertificate";
import OutgoingCertificate from "./pages/OutgoingCertificate";
import MenuAdmin from "./pages/MenuAdmin";
import Login from "./Login";

function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_ESPS_BE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setIsAuth(res.data?.status);
      })
      .catch(() => setIsAuth(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  return isAuth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="incoming" element={<IncomingCertificate />} />
          <Route path="outgoing" element={<OutgoingCertificate />} />
          <Route path="admin/*" element={<MenuAdmin />} />
        </Route>

        {/* Kalau route tidak ada, redirect ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
