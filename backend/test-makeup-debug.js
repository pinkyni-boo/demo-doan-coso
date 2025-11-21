import axios from "axios";

const API_URL = "http://localhost:5000/api";

async function testMakeupConflict() {
  try {
    // 1. Login
    console.log("1️⃣ Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: "admin",
      password: "admin123",
    });
    const token = loginRes.data.token;
    console.log("✅ Logged in as:", loginRes.data.fullName);
    console.log("");

    // 2. Get trainer classes
    console.log("2️⃣ Getting trainer's classes...");
    const classesRes = await axios.get(`${API_URL}/classes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const adminClasses = classesRes.data.filter(
      (c) =>
        c.instructorName === loginRes.data.fullName &&
        (c.status === "upcoming" || c.status === "ongoing")
    );

    console.log(
      `Found ${adminClasses.length} active classes for ${loginRes.data.fullName}`
    );

    if (adminClasses.length === 0) {
      console.log("❌ No classes found for testing");
      return;
    }

    const testClass = adminClasses[0];
    console.log("\n📚 Test class:", testClass.className);
    console.log("Schedule:", JSON.stringify(testClass.schedule, null, 2));
    console.log("");

    if (!testClass.schedule || testClass.schedule.length === 0) {
      console.log("❌ No schedule found");
      return;
    }

    const firstSlot = testClass.schedule[0];
    console.log("3️⃣ Testing with first schedule slot:");
    console.log("  dayOfWeek:", firstSlot.dayOfWeek);
    console.log("  time:", firstSlot.startTime, "-", firstSlot.endTime);
    console.log("");

    // 3. Find a date matching that day of week
    const today = new Date();
    let testDate = new Date(today);

    // Find next occurrence of that day
    const targetDay = parseInt(firstSlot.dayOfWeek);
    const currentDay = testDate.getDay();
    const daysToAdd = (targetDay - currentDay + 7) % 7;
    testDate.setDate(testDate.getDate() + (daysToAdd === 0 ? 7 : daysToAdd));

    const testDateStr = testDate.toISOString().split("T")[0];

    console.log("4️⃣ Testing conflict check:");
    console.log("  Date:", testDateStr);
    console.log("  Time:", firstSlot.startTime, "-", firstSlot.endTime);
    console.log("");

    // 4. Check conflict - SHOULD DETECT CONFLICT
    const params = new URLSearchParams({
      trainerId: loginRes.data.fullName,
      requestedDate: testDateStr,
      startTime: firstSlot.startTime,
      endTime: firstSlot.endTime,
    });

    console.log(
      "API call:",
      `${API_URL}/trainers/check-makeup-schedule-conflict?${params.toString()}`
    );
    console.log("");

    const conflictRes = await axios.get(
      `${API_URL}/trainers/check-makeup-schedule-conflict?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("5️⃣ Response:");
    console.log(JSON.stringify(conflictRes.data, null, 2));
    console.log("");

    if (conflictRes.data.hasConflict) {
      console.log("✅ SUCCESS: Conflict detected correctly!");
      console.log("Conflicts:", conflictRes.data.conflicts.length);
    } else {
      console.log("❌ FAILED: Should detect conflict but didn't!");
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testMakeupConflict();
