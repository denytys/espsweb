// src/helper/parsingCookies.jsx
export function setToken(token, expiry) {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("expired", expiry);
}

export function getToken() {
  return sessionStorage.getItem("token") || null;
}

export function clearToken() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("expired");
  sessionStorage.removeItem("user");
}
