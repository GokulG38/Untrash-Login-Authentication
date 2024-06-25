import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './axiosInstance';
import Loading from './Loading'; 

const checkAuth = (WrappedComponent) => {
  return () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const authRes = await axios.get('http://localhost:5000/auth-check');
          if (authRes.status !== 200) {
            throw new Error("Not authenticated");
          }
          const profileRes = await axios.get('http://localhost:5000/profile');
          setProfile(true);
        } catch (err) {
          
          if (err.response?.status === 401) {
            navigate('/login');
          } else {
            console.error("Error fetching profile:", err.message);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, [navigate, setProfile, setLoading]);

    if (loading) {
      return <Loading />;
    }

    return profile ? <WrappedComponent /> : null;
  };
};

export default checkAuth;
