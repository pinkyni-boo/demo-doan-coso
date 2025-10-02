import React, { useState, useEffect } from "react";
import axios from "axios";

const APITester = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint, name, method = "GET") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      console.log(`Testing ${method} ${endpoint}...`);

      let response;
      if (method === "POST") {
        response = await axios.post(
          endpoint,
          {},
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
      } else {
        response = await axios.get(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      }

      setTestResults((prev) => ({
        ...prev,
        [name]: {
          success: true,
          data: response.data,
          status: response.status,
        },
      }));
    } catch (error) {
      console.error(`Error testing ${endpoint}:`, error);
      setTestResults((prev) => ({
        ...prev,
        [name]: {
          success: false,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    await testAPI("/api/rooms/test", "roomsTest");
    await testAPI("/api/rooms", "roomsList");
    await testAPI("/api/equipment", "equipmentList");
  };

  const createSampleData = async () => {
    await testAPI("/api/rooms/create-samples", "createSamples", "POST");
    // Refresh the rooms list after creating samples
    setTimeout(async () => {
      await testAPI("/api/rooms", "roomsListAfterCreate");
    }, 1000);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">API Tester</h2>

      <div className="flex gap-4 mb-4">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          {loading ? "Testing..." : "Run Tests"}
        </button>

        <button
          onClick={createSampleData}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Create Sample Rooms
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(testResults).map(([name, result]) => (
          <div key={name} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{name}</h3>
            <div
              className={`p-3 rounded ${
                result.success ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p>
                <strong>Status:</strong> {result.status}
              </p>
              <p>
                <strong>Success:</strong> {result.success ? "Yes" : "No"}
              </p>
              {result.error && (
                <p>
                  <strong>Error:</strong> {result.error}
                </p>
              )}
              <details className="mt-2">
                <summary className="cursor-pointer">Response Data</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default APITester;
