import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerAction, resetRegisterStatus } from '../../redux/reducers/auth/register';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = ({ toggleLogin }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { loading, status, message, data: userData } = useSelector(state => state.register);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) navigate('/home');
  }, [navigate]);

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (loading) return;

    try {
      await dispatch(registerAction(data));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    }
  };

  // Handle success/error toast and redirect
  useEffect(() => {
    if (status === null || !message) return;

    if (status === true) {
      toast.success(message);
      dispatch(resetRegisterStatus());
      localStorage.setItem('jwt', JSON.stringify(userData.token));
      localStorage.setItem("user", JSON.stringify(userData));
      setTimeout(() => {
        navigate('/home');
      }, 500);
    } else if (status === false) {
      toast.error(message);
      dispatch(resetRegisterStatus());
    }
  }, [status, message, dispatch, userData, navigate]);

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-6 p-8 bg-white rounded-2xl shadow-lg w-96"
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center">Register</h2>

          <input
            value={data.name}
            onChange={handleChange}
            name="name"
            required
            type="text"
            placeholder="Full Name"
            className="p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

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

          <input
            value={data.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
            required
            type="password"
            placeholder="Confirm Password"
            className="p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <p onClick={toggleLogin} className="text-sm text-gray-500 text-center cursor-pointer">
            Already have an account?{' '}
            <span className="text-purple-600 hover:underline">Login</span>
          </p>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default Register;
