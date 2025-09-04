import axios from "axios";

const rq = axios.create({
    baseURL: import.meta.env.VITE_ESPS_BE,
    // withCredentials: true, // 🔑 penting
});

export default rq;
