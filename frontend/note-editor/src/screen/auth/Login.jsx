import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginAction, resetLoginStatus } from "../../redux/reducers/auth/login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./Register";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [toggleRegister, setToggleRegister] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, status, data: userData, message } = useSelector((state) => state.login);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) navigate("/home");
  }, [navigate]);


  useEffect(() => {
    if (status === null || !message) return;
    if (status === true) {
      toast.success(message);
      dispatch(resetLoginStatus());
      localStorage.setItem("jwt", JSON.stringify(userData.token));
      localStorage.setItem("user", JSON.stringify(userData));
      setTimeout(() => {
        navigate("/home");
      }, 500);
    } else if (status === false) {
      toast.error(message);
      dispatch(resetLoginStatus());
    }
  }, [status, message, dispatch, userData, navigate]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      await dispatch(loginAction(data));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  if (toggleRegister) {
    return <Register toggleLogin={() => setToggleRegister(false)} />;
  }

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-6 p-8 bg-white rounded-2xl shadow-lg w-96"
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center">Login</h2>

          <input
            value={data.email}
            onChange={handleChange}
            name="email"
            required
            type="email"
            placeholder="Email"
            className="p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <input
            value={data.password}
            onChange={handleChange}
            name="password"
            required
            type="password"
            placeholder="Password"
            className="p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p
            onClick={() => setToggleRegister(true)}
            className="text-sm text-gray-500 text-center cursor-pointer"
          >
            Don't have an account?{" "}
            <span className="text-purple-600 hover:underline">Sign up</span>
          </p>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default Login;
