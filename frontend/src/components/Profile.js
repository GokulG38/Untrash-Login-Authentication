import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "./axiosInstance";
import checkAuth from './checkAuth';


const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/profile');
        setUser(res.data.user);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className="flex justify-center items-start h-screen">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-12">
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <>
            <h2 className="text-2xl mb-4">{user.role === 'admin' ? 'Admin Profile' : 'User Profile'}</h2>
            <div>
              <p>Name: {user.name}</p>
              <p>Email: {user.email}</p>
              <p>Dummy Phone: 484585554528</p>
              <p>Dummy Address: 2323 street trivandrum</p>
              <p>Dummy Bio: orem ipsum dolor sit amet, consectetur as</p>
            </div>
          </>
        ) : (
          <p>No user data found.</p>
        )}
      </div>
    </div>
  );
};

export default checkAuth(Profile);
