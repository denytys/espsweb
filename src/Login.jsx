import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input, message } from "antd";
import rq from "./helper/request";
import { logDev } from "./utils/logDev";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await rq.post("/auth/login", {
        username,
        password,
      })
      const res = response.data;
      if (res.status && res.token) {
        sessionStorage.setItem("token", res.token); // simpan token
        message.success("Login berhasil");
        navigate("/dashboard");
      } else {
        message.error(res.message || "Login gagal");
      }
    } catch (error) {
      logDev(error);
      message.error(error.response?.data?.message || "Login gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-xs md:w-full max-w-sm p-8 bg-white/45 shadow-lg rounded-3xl backdrop-blur-md relative">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-2">
          <img src="logo_login.png" alt="logo" width="160" className="mb-2" />
          <p className="text-gray-600 text-lg">Selamat Datang</p>
          <h5 className="font-bold text-xl">di ESPS BARANTIN</h5>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: 16, height: 35, paddingLeft: 15 }}
            autoComplete="username"
            className="custom-input"
          />

          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 16, height: 35, paddingLeft: 15 }}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-3xs md:w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex justify-center items-center"
          >
            {isLoading && (
              <svg
                aria-hidden="true"
                role="status"
                className="w-4 h-4 mr-2 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
              >
                <path
                  d="M100 50.59C100 78.2 77.61 100.59 50 100.59C22.39 100.59 0 78.2 0 50.59C0 22.97 22.39 0.59 50 0.59C77.61 0.59 100 22.97 100 50.59ZM9.08 50.59C9.08 73.19 27.40 91.51 50 91.51C72.60 91.51 90.92 73.19 90.92 50.59C90.92 27.99 72.60 9.67 50 9.67C27.40 9.67 9.08 27.99 9.08 50.59Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.96 39.04C96.39 38.40 97.86 35.91 97.00 33.55C95.29 28.82 92.87 24.36 89.81 20.34C85.84 15.11 80.88 10.72 75.21 7.41C69.54 4.10 63.27 1.94 56.76 1.05C51.76 0.36 46.69 0.44 41.73 1.27C39.26 1.69 37.81 4.19 38.45 6.62C39.08 9.04 41.56 10.47 44.05 10.10C47.85 9.54 51.71 9.52 55.54 10.04C60.86 10.77 65.99 12.54 70.63 15.25C75.27 17.96 79.33 21.56 82.58 25.84C84.91 28.91 86.79 32.29 88.18 35.87C89.08 38.21 91.54 39.67 93.96 39.04Z"
                  fill="currentColor"
                />
              </svg>
            )}
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-gray-500">Lupa password? Hubungi admin.</small>
        </div>

        {/* Custom Input Styles */}
        <style>{`
          .custom-input,
          .custom-input-password-wrapper.ant-input-password {
            border: 1px solid #DEE8CE !important;
            border-radius: 0.5rem !important;
            transition: border-color 0.3s ease;
          }
          .custom-input:hover,
          .custom-input-password-wrapper.ant-input-password:hover {
            border-color: #059669 !important;
          }
          .custom-input:focus,
          .custom-input.ant-input-focused,
          .custom-input-password-wrapper.ant-input-password:focus-within {
            border-color: #059669 !important;
            outline: none;
          }
        `}</style>
      </div>
    </div>
  );
}
