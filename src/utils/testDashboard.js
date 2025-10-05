// Test dashboard API endpoints
// Run this in browser console or use as a standalone script

async function testDashboardAPIs() {
  const token = localStorage.getItem('token');
  console.log('🔑 Token:', token ? 'Found' : 'Not found');
  
  if (!token) {
    console.error('❌ No token found. Please login first.');
    return;
  }

  const baseURL = 'http://localhost:5000';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log('📊 Testing dashboard APIs...');

  // Test individual endpoints
  const endpoints = [
    '/api/admin/dashboard-stats',
    '/api/admin/users', 
    '/api/admin/trainers',
    '/api/admin/classes',
    '/api/payments/stats'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Testing ${endpoint}...`);
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers,
        timeout: 5000
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${endpoint}:`, data);
      } else {
        console.error(`❌ ${endpoint} Error:`, response.status, data);
      }
    } catch (error) {
      console.error(`💥 ${endpoint} Exception:`, error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('🏁 Dashboard API testing completed!');
}

// Test individual data sources
async function testDataSources() {
  console.log('📋 Testing data sources directly...');
  
  try {
    // Test if backend is reachable
    const healthCheck = await fetch('http://localhost:5000/api/auth/status');
    console.log('🌐 Backend health:', healthCheck.status);
    
    // Test auth
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👤 Current user:', user);
    console.log('🎫 Has token:', !!token);
    console.log('👑 Is admin:', user.role === 'admin');
    
  } catch (error) {
    console.error('💥 Data source test failed:', error);
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.testDashboardAPIs = testDashboardAPIs;
  window.testDataSources = testDataSources;
  console.log('🔧 Dashboard test functions loaded!');
  console.log('Run: testDashboardAPIs() or testDataSources()');
}

export { testDashboardAPIs, testDataSources };