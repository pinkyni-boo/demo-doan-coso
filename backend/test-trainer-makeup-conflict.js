import axios from "axios";

const API_URL = "http://localhost:5000/api";

async function testTrainerMakeupConflict() {
  console.log("🧪 Testing Trainer Makeup Schedule Conflict Check\n");

  try {
    // 1. Login as trainer
    console.log("1️⃣ Logging in as trainer...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: "trainer1",
      password: "trainer123",
    });
    const token = loginRes.data.token;
    const trainerName = loginRes.data.fullName;
    console.log(`✅ Logged in as: ${trainerName}\n`);

    // 2. Test case: Conflict with regular class schedule
    console.log("2️⃣ Test case: Conflict with regular class (same day of week)");
    const params1 = new URLSearchParams({
      trainerId: trainerName,
      requestedDate: "2025-11-24", // Monday
    });

    const res1 = await axios.get(
      `${API_URL}/trainers/check-makeup-schedule-conflict?${params1.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Response:", JSON.stringify(res1.data, null, 2));
    if (res1.data.hasConflict) {
      console.log("✅ Conflict detected with regular class!");
      console.log("Conflicts count:", res1.data.conflicts.length);
    } else {
      console.log(
        "⚠️ No conflict detected (might be OK if no class on Monday)"
      );
    }
    console.log("");

    // 3. Test case: No conflict (Sunday)
    console.log("3️⃣ Test case: No conflict (Sunday)");
    const params2 = new URLSearchParams({
      trainerId: trainerName,
      requestedDate: "2025-11-23", // Sunday
    });

    const res2 = await axios.get(
      `${API_URL}/trainers/check-makeup-schedule-conflict?${params2.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Response:", JSON.stringify(res2.data, null, 2));
    if (!res2.data.hasConflict) {
      console.log("✅ No conflict detected correctly!");
    } else {
      console.log("⚠️ Unexpected conflict found");
    }
    console.log("");

    // 4. Test case: Missing parameters
    console.log("4️⃣ Test case: Missing parameters validation");
    try {
      await axios.get(`${API_URL}/trainers/check-makeup-schedule-conflict`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("❌ Should have failed - Missing params accepted");
    } catch (error) {
      console.log("✅ Validation works - Missing params rejected");
      console.log("Error:", error.response?.data?.message || error.message);
    }

    console.log("\n🎉 All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testTrainerMakeupConflict();
