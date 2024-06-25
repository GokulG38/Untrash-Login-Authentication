import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './axiosInstance';
import DashboardCard from "./DashboardCard"
import checkAuth from './checkAuth';

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        
        const res = await axios.get('http://localhost:5000/dashboard');
        console.log(res)
        setResources(res.data.resources);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        }
        setLoading(false);
      }
    };

    fetchResources();

  }, [navigate]);

  return (
    <div className="flex justify-center h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(resource => (
              <DashboardCard key={resource._id} resource={resource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default checkAuth(Dashboard);