import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Spin, Modal } from "antd";
import Home from "./Home";
import Dashboard from "./pages/Dashboard";
import IncomingCertificate from "./pages/IncomingCertificate";
import OutgoingCertificate from "./pages/OutgoingCertificate";
import MenuAdmin from "./pages/MenuAdmin";
import Maintenance from "./pages/Maintenance";
import Login from "./Login";
import Assistant from "./pages/Assistant";

function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setIsAuth(false);
      setLoading(false);
      return;
    }

    axios
      .get(`${import.meta.env.VITE_ESPS_BE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setIsAuth(res.data?.status);
      })
      .catch(() => setIsAuth(false))
      .finally(() => {
        setTimeout(() => setLoading(false), 1000);
      });
  }, [token]);

  if (loading) {
    return (
      <Modal open={true} footer={null} closable={false} centered>
        <div className="text-center p-4">
          <Spin size="large" />
          <div className="mt-3 font-semibold">Loading . . .</div>
        </div>
      </Modal>
    );
  }

  return isAuth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router basename="/esps/">
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
          <Route path="assistant" element={<Assistant />} />
        </Route>

        {/* Kalau route tidak ada, redirect ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
