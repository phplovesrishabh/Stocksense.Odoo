require('dotenv').config({ path: '../server/.env' });

async function testDashboard() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@demo.com',
        password: 'Password@1234'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    const dashRes = await fetch('http://localhost:5000/api/v1/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    console.log("Dashboard response:", JSON.stringify(dashData, null, 2));
  } catch (err) {
    console.error(err);
  }
}
testDashboard();
