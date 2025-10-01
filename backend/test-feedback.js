// Test script để kiểm tra feedback API
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Test data
const testFeedback = {
  feedbackType: "general",
  overallRating: 5,
  ratings: {
    serviceQuality: 5,
    equipmentQuality: 4,
    cleanliness: 5,
    staffService: 5,
    valueForMoney: 4,
    atmosphere: 5,
  },
  title: "Dịch vụ tuyệt vời!",
  content:
    "Tôi rất hài lòng với chất lượng dịch vụ tại Royal Fitness. Thiết bị hiện đại, nhân viên tận tâm.",
  type: "general",
  tags: ["equipment", "staff"],
  isAnonymous: false,
  wouldRecommend: true,
  images: [],
};

async function testFeedbackAPI() {
  try {
    console.log("🧪 Testing Feedback API...");

    // Test GET /api/feedbacks (public)
    console.log("\n📊 Testing GET /api/feedbacks...");
    const response = await axios.get(`${API_BASE}/feedbacks`);
    console.log("✅ Public feedbacks:", response.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testFeedbackAPI();
