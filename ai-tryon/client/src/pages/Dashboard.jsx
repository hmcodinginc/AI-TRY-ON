import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, outfits: 0, tryons: 0, lastSynced: null });
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:6001/api/dashboard-stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      const { data } = await axios.post('http://127.0.0.1:6001/api/sync/products', { merchantId: 'merchant_demo' });
      setSyncResult(data);
      await fetchStats();
      
      // Auto-hide toast after 5s
      setTimeout(() => setSyncResult(null), 5000);
    } catch (error) {
      const message = error.response?.data?.message || 'Sync failed. Check if merchant backend is running.';
      setSyncResult({ success: false, message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button 
          onClick={handleSync} 
          disabled={syncing}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Products'}
        </button>
      </div>

      {syncResult && (
        <div className={`p-4 rounded flex items-center shadow-sm ${!syncResult.success ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {!syncResult.success ? (
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          ) : (
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          )}
          <div>
            {!syncResult.success ? (
              <span className="font-medium">{syncResult.message}</span>
            ) : (
              <div>
                <span className="font-medium">✓ Products synchronized successfully</span>
                <span className="ml-2 text-sm">(Added: {syncResult.synced}, Updated: {syncResult.updated}, Failed: {syncResult.failed})</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Connected Merchant</h3>
          <p className="text-xl font-bold mt-2">Demo Fashion Store</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Products Synced</h3>
          <p className="text-3xl font-bold mt-2">{stats.products}</p>
          <p className="text-xs text-gray-400 mt-1">
            Last Synced: {stats.lastSynced ? new Date(stats.lastSynced).toLocaleString() : 'Never'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Outfits</h3>
          <p className="text-3xl font-bold mt-2">{stats.outfits}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Try-Ons</h3>
          <p className="text-3xl font-bold mt-2">{stats.tryons}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border mt-8">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link to="/products" className="text-indigo-600 hover:underline">View Synced Products</Link>
          <Link to="/outfit-studio" className="text-indigo-600 hover:underline">Create Outfits</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
