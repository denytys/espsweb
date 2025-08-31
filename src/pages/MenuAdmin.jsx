// pages/MenuAdmin.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import Maintenance from "./Maintenance";
import UserManagement from "./UserManagement";
import NegaraMitra from "./NegaraMitra";
import ValidationTool from "./ValidationTool";

export default function MenuAdmin() {
  return (
    <Routes>
      <Route index element={<Navigate to="admin-users" replace />} />
      <Route path="admin-mitra" element={<NegaraMitra />} />
      <Route path="admin-users" element={<UserManagement />} />
      <Route path="admin-settings" element={<ValidationTool />} />
    </Routes>
  );
}
