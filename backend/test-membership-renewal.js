/**
 * Test script for membership renewal functionality
 *
 * Usage: node backend/test-membership-renewal.js
 */

import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// Test data - Update these with actual values from your database
const TEST_MEMBERSHIP_ID = "YOUR_MEMBERSHIP_ID_HERE";
const ADMIN_TOKEN = "YOUR_ADMIN_TOKEN_HERE";

async function testMembershipRenewal() {
  console.log("🧪 Testing Membership Renewal API...\n");

  try {
    // Test 1: Renew membership with basic-monthly package
    console.log("📝 Test 1: Renewing membership with basic-monthly package");
    const response1 = await axios.post(
      `${BASE_URL}/memberships/renew/${TEST_MEMBERSHIP_ID}`,
      {
        type: "basic-monthly",
        price: 500000,
        paymentStatus: true,
      },
      {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Success:", response1.data.message);
    console.log("📋 Updated Membership:", {
      id: response1.data.membership._id,
      type: response1.data.membership.type,
      startDate: response1.data.membership.startDate,
      endDate: response1.data.membership.endDate,
      status: response1.data.membership.status,
      paymentStatus: response1.data.membership.paymentStatus,
    });
    console.log("\n");

    // Test 2: Renew with annual package
    console.log("📝 Test 2: Renewing membership with vip-annual package");
    const response2 = await axios.post(
      `${BASE_URL}/memberships/renew/${TEST_MEMBERSHIP_ID}`,
      {
        type: "vip-annual",
        price: 12000000,
        paymentStatus: false, // Pending payment
      },
      {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Success:", response2.data.message);
    console.log("📋 Updated Membership:", {
      id: response2.data.membership._id,
      type: response2.data.membership.type,
      startDate: response2.data.membership.startDate,
      endDate: response2.data.membership.endDate,
      status: response2.data.membership.status,
      paymentStatus: response2.data.membership.paymentStatus,
    });
    console.log("\n");

    // Test 3: Try to renew cancelled membership (should fail)
    console.log(
      "📝 Test 3: Trying to renew cancelled membership (should fail)"
    );
    try {
      await axios.post(
        `${BASE_URL}/memberships/renew/CANCELLED_MEMBERSHIP_ID`,
        {
          type: "standard-monthly",
          price: 800000,
          paymentStatus: true,
        },
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.log("✅ Expected error:", error.response?.data?.message);
    }

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Instructions
console.log("📖 Instructions:");
console.log(
  "1. Update TEST_MEMBERSHIP_ID with an actual membership ID from your database"
);
console.log("2. Login as admin and copy the token to ADMIN_TOKEN");
console.log("3. Make sure the backend server is running on port 5000");
console.log("4. Run: node backend/test-membership-renewal.js\n");
console.log("═══════════════════════════════════════════════════════════\n");

// Uncomment this line when ready to test
// testMembershipRenewal();

console.log(
  "⚠️  Please update the test data in the script first, then uncomment the testMembershipRenewal() call."
);
