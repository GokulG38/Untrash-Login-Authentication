
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from './axiosInstance';
import checkAuth from './checkAuth';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/logout');
      sessionStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  return (
    <nav className="flex items-center justify-between bg-gray-800 text-white p-4">
      <div className="text-xl font-bold">UNTRASH</div>
      <div className="flex items-center">
        <Link to="/profile" className="ml-4">Profile</Link>
        <Link to="/dashboard" className="ml-4">Dashboard</Link>
        <button onClick={handleLogout} className="ml-4 bg-transparent border border-white rounded px-3 py-1 hover:bg-white hover:text-gray-800">Logout</button>
      </div>
    </nav>
  );
};

export default checkAuth(Navbar);
