import axios from "axios";

const VITE_API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

const localUrl = "http://localhost:4000";
const authAxios = axios.create({
  baseURL: localUrl,
  headers: {
    Authorization: `Bearer ${JSON.parse(localStorage.getItem("jwt"))}` || {},
  },
});
authAxios.interceptors.request.use(
  (config) => {
    const jwt = JSON.parse(localStorage.getItem("jwt"));

    if (jwt) {
      config.headers["Authorization"] = `Bearer ${jwt}`;
    }


    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authAxios.interceptors.response.use(
  async (response) => {
    return response;
  },
  (error) => {
    let {
      response: {
        data: { status, message },
      },
    } = error;
    return Promise.reject(error);
  }
);

export default authAxios;
