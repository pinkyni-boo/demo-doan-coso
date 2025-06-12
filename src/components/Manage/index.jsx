import { useState } from "react";

const userClasses = [
  {
    id: 1,
    name: "Gym Cá Nhân - Lớp Sáng",
    time: "06:00 - 07:00",
    instructor: "Nguyễn Văn A",
    room: "Phòng 101",
    registeredTime: "2025-04-15T05:30:00Z",
  },
  {
    id: 2,
    name: "Yoga & Pilates - Lớp Chiều",
    time: "17:00 - 18:00",
    instructor: "Trần Thị B",
    room: "Phòng 102",
    registeredTime: "2025-04-15T16:00:00Z",
  },
  {
    id: 3,
    name: "Cardio - Lớp Sáng",
    time: "07:00 - 08:00",
    instructor: "Phan Minh E",
    room: "Phòng 105",
    registeredTime: "2025-04-14T08:00:00Z",
  },
];

export default function UserSchedule() {
  const [userClassesState, setUserClassesState] = useState(userClasses);

  const handleCancelClass = (index) => {
    const classToCancel = userClassesState[index];
    const currentTime = new Date();
    const classTime = new Date(classToCancel.registeredTime);
    const timeDifference = (classTime - currentTime) / (1000 * 60 * 60); // time difference in hours

    if (timeDifference <= 12) {
      alert("Bạn không thể hủy lớp tập này vì còn quá ít thời gian.");
    } else {
      const updatedClasses = userClassesState.filter((_, idx) => idx !== index);
      setUserClassesState(updatedClasses);
      alert("Lớp tập đã được hủy thành công!");
    }
  };

  return (
    <div className="p-10 bg-gray-800 min-h-screen text-white">
      <h1 className="text-5xl font-extrabold text-center mb-10">
        Quản Lý Lịch Tập
      </h1>

      {userClassesState.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userClassesState.map((gymClass, index) => (
            <div
              key={gymClass.id}
              className="bg-white text-black rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative">
                <img
                  className="w-full h-48 rounded-t-lg object-cover"
                  src="https://via.placeholder.com/400x200"
                  alt="Gym Class"
                />
                <div className="absolute top-0 left-0 p-4 text-xl font-semibold text-white bg-black bg-opacity-60 rounded-t-lg">
                  {gymClass.name}
                </div>
              </div>
              <div className="p-6">
                <p className="text-lg font-medium text-gray-800">
                  Thời gian: {gymClass.time}
                </p>
                <p className="text-sm text-gray-600">
                  Huấn luyện viên: {gymClass.instructor}
                </p>
                <p className="text-sm text-gray-600">
                  Phòng tập: {gymClass.room}
                </p>

                <div className="mt-6 flex justify-between space-x-4">
                  <button
                    onClick={() => handleCancelClass(index)}
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Hủy lớp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-xl text-gray-300 mt-10">
          Chưa có lớp nào được đăng ký.
        </div>
      )}
    </div>
  );
}
