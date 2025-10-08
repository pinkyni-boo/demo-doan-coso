/**
 * Script test API kiểm tra phòng trống cho lịch dạy bù
 * Test việc tìm phòng trống và phát hiện xung đột
 */

import axios from "axios";

// Configuration
const API_BASE_URL = "http://localhost:5000/api";
const TEST_ADMIN_TOKEN = "your_admin_token_here"; // Thay bằng token admin thực tế

async function testRoomAvailability() {
  console.log("🧪 Testing Room Availability API...\n");

  // Test cases
  const testCases = [
    {
      name: "Kiểm tra phòng trống buổi sáng",
      params: {
        date: "2025-10-15",
        startTime: "08:00",
        endTime: "10:00",
      },
    },
    {
      name: "Kiểm tra phòng trống buổi chiều",
      params: {
        date: "2025-10-15",
        startTime: "14:00",
        endTime: "16:00",
      },
    },
    {
      name: "Kiểm tra phòng trống buổi tối (có thể có xung đột)",
      params: {
        date: "2025-10-15",
        startTime: "19:00",
        endTime: "21:00",
      },
    },
    {
      name: "Kiểm tra thời gian không hợp lệ",
      params: {
        date: "2025-10-15",
        startTime: "21:00",
        endTime: "19:00", // End time before start time
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`Parameters:`, testCase.params);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/rooms/available/check`,
        {
          headers: {
            Authorization: `Bearer ${TEST_ADMIN_TOKEN}`,
          },
          params: testCase.params,
        }
      );

      if (response.data.success) {
        const { availableRooms, conflictRooms, searchParams } =
          response.data.data;

        console.log("✅ Request successful");
        console.log(`📅 Search day: ${searchParams.dayOfWeek}`);
        console.log(`🟢 Available rooms: ${availableRooms.length}`);

        if (availableRooms.length > 0) {
          console.log("Available rooms:");
          availableRooms.forEach((room, index) => {
            console.log(
              `  ${index + 1}. ${room.roomName} (${
                room.location
              }) - Capacity: ${room.capacity}`
            );
          });
        }

        console.log(`🔴 Conflicted rooms: ${conflictRooms.length}`);
        if (conflictRooms.length > 0) {
          console.log("Conflicted rooms:");
          conflictRooms.forEach((room, index) => {
            console.log(`  ${index + 1}. ${room.roomName}`);
            room.conflicts.forEach((conflict, cIndex) => {
              console.log(
                `     - ${conflict.type}: ${conflict.name} (${conflict.time}) - ${conflict.instructor}`
              );
            });
          });
        }
      } else {
        console.log("❌ Request failed:", response.data.message);
      }
    } catch (error) {
      if (error.response) {
        console.log(
          "❌ API Error:",
          error.response.status,
          error.response.data.message
        );
      } else {
        console.log("❌ Network Error:", error.message);
      }
    }
  }
}

// Test với missing parameters
async function testInvalidRequests() {
  console.log("\n\n🧪 Testing Invalid Requests...\n");

  const invalidCases = [
    {
      name: "Missing date",
      params: { startTime: "08:00", endTime: "10:00" },
    },
    {
      name: "Missing startTime",
      params: { date: "2025-10-15", endTime: "10:00" },
    },
    {
      name: "Missing endTime",
      params: { date: "2025-10-15", startTime: "08:00" },
    },
    {
      name: "Empty request",
      params: {},
    },
  ];

  for (const testCase of invalidCases) {
    console.log(`\n📋 Test: ${testCase.name}`);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/rooms/available/check`,
        {
          headers: {
            Authorization: `Bearer ${TEST_ADMIN_TOKEN}`,
          },
          params: testCase.params,
        }
      );

      console.log("❌ Expected error but got success:", response.data);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(
          "✅ Correctly returned 400 error:",
          error.response.data.message
        );
      } else {
        console.log(
          "❌ Unexpected error:",
          error.response?.data || error.message
        );
      }
    }
  }
}

// Test authorization
async function testUnauthorizedAccess() {
  console.log("\n\n🧪 Testing Unauthorized Access...\n");

  try {
    const response = await axios.get(`${API_BASE_URL}/rooms/available/check`, {
      // No authorization header
      params: {
        date: "2025-10-15",
        startTime: "08:00",
        endTime: "10:00",
      },
    });

    console.log("❌ Expected 401 but got success:", response.data);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("✅ Correctly returned 401 unauthorized");
    } else {
      console.log(
        "❌ Unexpected error:",
        error.response?.data || error.message
      );
    }
  }

  // Test with invalid token
  try {
    const response = await axios.get(`${API_BASE_URL}/rooms/available/check`, {
      headers: {
        Authorization: "Bearer invalid_token",
      },
      params: {
        date: "2025-10-15",
        startTime: "08:00",
        endTime: "10:00",
      },
    });

    console.log("❌ Expected 401 but got success:", response.data);
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.log("✅ Correctly returned auth error with invalid token");
    } else {
      console.log(
        "❌ Unexpected error:",
        error.response?.data || error.message
      );
    }
  }
}

// Chạy tất cả tests
async function runAllTests() {
  console.log("🚀 Starting Room Availability API Tests");
  console.log("=" * 50);

  if (TEST_ADMIN_TOKEN === "your_admin_token_here") {
    console.log(
      "⚠️ WARNING: Please update TEST_ADMIN_TOKEN with a real admin token"
    );
    console.log("You can get it by:");
    console.log("1. Login as admin in the app");
    console.log('2. Check localStorage.getItem("token") in browser console');
    console.log("3. Copy the token value to TEST_ADMIN_TOKEN in this script\n");
  }

  await testRoomAvailability();
  await testInvalidRequests();
  await testUnauthorizedAccess();

  console.log("\n🏁 All tests completed!");
  console.log("\n💡 Next steps:");
  console.log("- Test in browser admin panel");
  console.log("- Create makeup schedules and verify room conflicts");
  console.log("- Check room availability in real-time");
}

// Manual test function cho browser console
function createBrowserTestInstructions() {
  console.log("\n📋 Manual Browser Test Instructions:");
  console.log("1. Login as admin");
  console.log("2. Go to Schedule Requests page");
  console.log("3. Find an approved request");
  console.log('4. Click "Thêm lịch dạy bù"');
  console.log("5. Fill in date and time");
  console.log("6. Observe room dropdown updates automatically");
  console.log("7. Try different times to see conflicts");

  return `
// Run this in browser console after login:
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/rooms/available/check?date=2025-10-15&startTime=19:00&endTime=21:00', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.json())
.then(data => console.log('Room availability:', data));
  `;
}

// Export for module usage
export {
  testRoomAvailability,
  testInvalidRequests,
  testUnauthorizedAccess,
  createBrowserTestInstructions,
};

// Chỉ chạy nếu file này được gọi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}
