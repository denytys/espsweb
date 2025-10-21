import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { logDev } from "../utils/logDev";
import { Card, Switch, Modal } from "antd";
import { Moon, Sun } from "lucide-react";
import DinoGame from "./DinoGame";

export default function Header({ menuTheme, setMenuTheme }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const token = sessionStorage.getItem("token");
  const [isDinoOpen, setIsDinoOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_ESPS_BE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.status) setUser(res.data.user);
        else navigate("/login");
      })
      .catch(() => navigate("/login"));
  }, [navigate, token]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_ESPS_BE}/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      logDev("Logout gagal:", err);
    }
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = (checked) => {
    setMenuTheme(checked ? "dark" : "light");
  };

  return (
    <>
      <Card
        styles={{
          body: { padding: "6px" },
          header: { padding: "0", borderBottom: "none" },
        }}
        style={{
          borderRadius: "12px 12px 12px 12px",
          marginLeft: "8px",
          marginRight: "8px",
          paddingRight: "8px",
        }}
        className="shadow-none border-none rounded-b-xl relative"
      >
        <div className="flex justify-between items-center">
          <div>
            <img src="logo_login.png" alt="logo" width="100" />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={menuTheme === "dark"}
              onChange={toggleTheme}
              checkedChildren={
                <div className="flex items-center justify-center">
                  <Moon size={14} className="text-white mt-1" />
                </div>
              }
              unCheckedChildren={
                <div className="flex items-center justify-center">
                  <Sun size={14} className="text-white mt-1" />
                </div>
              }
            />

            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1 focus:outline-none cursor-pointer select-none"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center uppercase">
                  {user?.nama ? user.nama.charAt(0) : "U"}
                </div>
                <span
                  className={`text-xs hidden sm:block ${
                    menuTheme === "dark" ? "text-white" : "text-black"
                  }`}
                >
                  {user?.nama || "User"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`absolute right-0 top-full mt-1 w-32 ${
                  menuTheme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-800"
                } shadow-xl rounded-lg z-50 text-sm transform transition-all duration-200 ease-out origin-top-right ${
                  dropdownOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                }`}
                ref={dropdownRef}
              >
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setIsDinoOpen(true); // buka modal DinoGame
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-300/10 transition"
                >
                  Special Menu
                </button>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-blue-300/20 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        open={isDinoOpen}
        onCancel={() => {
          setIsDinoOpen(false);
          setResetKey((prev) => prev + 1);
        }}
        footer={null}
        width={650}
        centered
      >
        <DinoGame resetKey={resetKey} />
      </Modal>
    </>
  );
}
