import React, { useState } from 'react';
import { FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const IntegrationManagement = ({ platform }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsConnected(false);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-6">Integrasi {platform}</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-start">
          <div className="bg-gray-200 w-16 h-16 rounded-lg mr-4"></div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">{platform} Integration</h3>
            <p className="text-gray-600 mb-4">
              Hubungkan sistem Kasir Pro dengan {platform} untuk menerima orderan langsung dari platform.
            </p>
            
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <>
                  <span className="flex items-center text-green-600">
                    <FiCheckCircle className="mr-1" /> Terhubung
                  </span>
                  <button
                    onClick={handleDisconnect}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <FiRefreshCw className="animate-spin inline mr-1" />
                    ) : (
                      <FiXCircle className="inline mr-1" />
                    )}
                    Putuskan
                  </button>
                </>
              ) : (
                <>
                  <span className="flex items-center text-gray-500">
                    <FiXCircle className="mr-1" /> Tidak Terhubung
                  </span>
                  <button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <FiRefreshCw className="animate-spin inline mr-1" />
                    ) : null}
                    Hubungkan
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationManagement;