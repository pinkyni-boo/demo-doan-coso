import axios from "axios";

// Configuration
const BASE_URL = "http://localhost:3000";
let authToken = "";

// Helper function to log results
const log = (title, data) => {
  console.log("\n" + "=".repeat(60));
  console.log(title);
  console.log("=".repeat(60));
  console.log(JSON.stringify(data, null, 2));
};

// Test 1: Login to get token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: "admin",
      password: "admin123",
    });
    authToken = response.data.token;
    log("✅ TEST 1: LOGIN SUCCESS", {
      token: authToken.substring(0, 20) + "...",
      role: response.data.role,
    });
    return true;
  } catch (error) {
    log("❌ TEST 1: LOGIN FAILED", error.response?.data || error.message);
    return false;
  }
}

// Test 2: Get list of trainers
async function getTrainers() {
  try {
    const response = await axios.get(`${BASE_URL}/api/trainers`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    log("✅ TEST 2: GET TRAINERS SUCCESS", {
      count: response.data.length,
      trainers: response.data.map((t) => ({
        id: t._id,
        name: t.fullName,
        specialization: t.specialization,
      })),
    });
    return response.data;
  } catch (error) {
    log(
      "❌ TEST 2: GET TRAINERS FAILED",
      error.response?.data || error.message
    );
    return [];
  }
}

// Test 3: Get existing classes for a trainer
async function getTrainerClasses(trainerId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/classes`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const trainerClasses = response.data.filter(
      (cls) =>
        cls.instructorId === trainerId &&
        (cls.status === "upcoming" || cls.status === "ongoing")
    );

    log("✅ TEST 3: GET TRAINER CLASSES", {
      trainerId,
      totalClasses: response.data.length,
      trainerClasses: trainerClasses.length,
      classes: trainerClasses.map((cls) => ({
        id: cls._id,
        name: cls.className,
        schedule: cls.schedule,
        startDate: cls.startDate,
        endDate: cls.endDate,
      })),
    });
    return trainerClasses;
  } catch (error) {
    log("❌ TEST 3: GET CLASSES FAILED", error.response?.data || error.message);
    return [];
  }
}

// Test 4: Check conflict - NO CONFLICT scenario
async function testNoConflict(trainerId) {
  try {
    const schedule = [
      { dayOfWeek: "Thứ 2", startTime: "06:00", endTime: "07:30" },
      { dayOfWeek: "Thứ 4", startTime: "06:00", endTime: "07:30" },
    ];

    const params = new URLSearchParams({
      trainerId,
      schedule: JSON.stringify(schedule),
      startDate: "2024-12-20",
      endDate: "2025-03-20",
    });

    const response = await axios.get(
      `${BASE_URL}/api/trainers/check-schedule-conflict?${params.toString()}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    log("✅ TEST 4: NO CONFLICT SCENARIO", response.data);
    return response.data;
  } catch (error) {
    log(
      "❌ TEST 4: CHECK CONFLICT FAILED",
      error.response?.data || error.message
    );
    return null;
  }
}

// Test 5: Check conflict - CONFLICT scenario
async function testWithConflict(trainerId, existingSchedule) {
  try {
    // Create overlapping schedule
    const conflictingSchedule = [
      {
        dayOfWeek: existingSchedule[0].dayOfWeek,
        startTime: "14:30", // Overlaps with 14:00-15:00
        endTime: "16:00",
      },
    ];

    const params = new URLSearchParams({
      trainerId,
      schedule: JSON.stringify(conflictingSchedule),
      startDate: "2024-12-20",
      endDate: "2025-03-20",
    });

    const response = await axios.get(
      `${BASE_URL}/api/trainers/check-schedule-conflict?${params.toString()}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    log("✅ TEST 5: CONFLICT SCENARIO", response.data);
    return response.data;
  } catch (error) {
    log(
      "❌ TEST 5: CHECK CONFLICT FAILED",
      error.response?.data || error.message
    );
    return null;
  }
}

// Test 6: Edge case - same start and end times
async function testExactOverlap(trainerId, existingSchedule) {
  try {
    const exactSchedule = [
      {
        dayOfWeek: existingSchedule[0].dayOfWeek,
        startTime: existingSchedule[0].startTime,
        endTime: existingSchedule[0].endTime,
      },
    ];

    const params = new URLSearchParams({
      trainerId,
      schedule: JSON.stringify(exactSchedule),
      startDate: "2024-12-20",
      endDate: "2025-03-20",
    });

    const response = await axios.get(
      `${BASE_URL}/api/trainers/check-schedule-conflict?${params.toString()}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    log("✅ TEST 6: EXACT OVERLAP SCENARIO", response.data);
    return response.data;
  } catch (error) {
    log(
      "❌ TEST 6: EXACT OVERLAP FAILED",
      error.response?.data || error.message
    );
    return null;
  }
}

// Test 7: Missing parameters validation
async function testMissingParams() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/trainers/check-schedule-conflict`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    log("❌ TEST 7: SHOULD FAIL - Missing params accepted", response.data);
    return response.data;
  } catch (error) {
    log("✅ TEST 7: VALIDATION WORKS - Missing params rejected", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    return null;
  }
}

// Main test runner
async function runAllTests() {
  console.log("\n🚀 STARTING TRAINER SCHEDULE CONFLICT TESTS");
  console.log("Target: http://localhost:3000");
  console.log("Time:", new Date().toLocaleString("vi-VN"));

  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log("\n❌ Cannot proceed without authentication");
    return;
  }

  // Step 2: Get trainers
  const trainers = await getTrainers();
  if (trainers.length === 0) {
    console.log("\n❌ No trainers found");
    return;
  }

  const testTrainerId = trainers[0]._id;
  console.log(
    `\n📋 Using trainer: ${trainers[0].fullName} (ID: ${testTrainerId})`
  );

  // Step 3: Get trainer's existing classes
  const trainerClasses = await getTrainerClasses(testTrainerId);

  // Step 4-7: Run conflict tests
  await testMissingParams();
  await testNoConflict(testTrainerId);

  if (trainerClasses.length > 0 && trainerClasses[0].schedule.length > 0) {
    await testWithConflict(testTrainerId, trainerClasses[0].schedule);
    await testExactOverlap(testTrainerId, trainerClasses[0].schedule);
  } else {
    console.log("\n⚠️ No existing classes found for conflict testing");
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ ALL TESTS COMPLETED");
  console.log("=".repeat(60));
}

// Run tests
runAllTests().catch((error) => {
  console.error("\n❌ FATAL ERROR:", error.message);
  process.exit(1);
});
