import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_ESPS_BE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.status) {
          setUser(res.data.user);
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate, token]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_ESPS_BE}/auth/logout`,
        {}, // body kosong
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Logout gagal:", err);
    }
    sessionStorage.removeItem("token"); // hapus token biar aman
    navigate("/login");
  };

  // Close dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-blue-50/40 shadow-lg px-6 py-3 flex justify-end items-center relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 focus:outline-none cursor-pointer select-none"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold uppercase">
          {user?.nama ? user.nama.charAt(0) : "U"}
        </div>
        <span className="hidden sm:block">{user?.nama || "User"}</span>
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
        className={`absolute right-0 top-full mt-1 w-44 bg-white/85 shadow-xl rounded-xl z-50 text-sm text-gray-800 transform transition-all duration-200 ease-out origin-top-right ${
          dropdownOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
        ref={dropdownRef}
      >
        <button
          onClick={() => {
            navigate("/dashboard");
            setDropdownOpen(false);
          }}
          className="w-full text-left px-4 py-2 hover:bg-blue-300/20 transition"
        >
          Ubah password
        </button>
        <hr className="my-1 border-gray-200" />
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-red-500 hover:bg-blue-300/20 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
