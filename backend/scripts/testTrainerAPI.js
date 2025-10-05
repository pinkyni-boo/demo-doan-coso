import axios from "axios";

// Test script để kiểm tra API trainers
async function testTrainerAPI() {
  try {
    console.log("🧪 Testing Trainer API...");

    // Test 1: Login với admin account
    console.log("1. Testing login...");
    const loginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: "admin@fitness.com", // hoặc email admin khác
        password: "admin123",
      }
    );

    if (loginResponse.data.success) {
      console.log("✅ Login successful");
      const token = loginResponse.data.token;

      // Test 2: Get trainers
      console.log("2. Testing get trainers...");
      const trainersResponse = await axios.get(
        "http://localhost:5000/api/trainers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Trainers API response:", trainersResponse.data);
      console.log(`📋 Found ${trainersResponse.data.length} trainers`);

      if (trainersResponse.data.length === 0) {
        console.log("⚠️ No trainers found. You may need to create some.");
      } else {
        trainersResponse.data.forEach((trainer, index) => {
          console.log(
            `  ${index + 1}. ${trainer.fullName} (${trainer.email}) - ${
              trainer.status
            }`
          );
        });
      }
    } else {
      console.log("❌ Login failed:", loginResponse.data.message);
    }
  } catch (error) {
    console.error(
      "❌ Error testing API:",
      error.response?.data || error.message
    );
  }
}

// Test với alternative admin credentials
async function testWithDifferentCredentials() {
  const credentials = [
    { email: "admin@fitness.com", password: "admin123" },
    { email: "admin@gym.com", password: "admin123" },
    { email: "admin@example.com", password: "admin123" },
    { email: "admin@fitness.com", password: "123456" },
  ];

  for (const cred of credentials) {
    try {
      console.log(`\n🔑 Trying login with ${cred.email}...`);
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        cred
      );

      if (response.data.success) {
        console.log(`✅ Success with ${cred.email}`);
        const token = response.data.token;

        // Test trainers API
        const trainersResponse = await axios.get(
          "http://localhost:5000/api/trainers",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(`📋 Trainers: ${trainersResponse.data.length} found`);
        return; // Stop after first successful login
      }
    } catch (error) {
      console.log(
        `❌ Failed with ${cred.email}: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
}

console.log("Starting trainer API test...");
testTrainerAPI();
