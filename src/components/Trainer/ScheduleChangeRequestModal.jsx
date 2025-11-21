import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, Send, MessageSquare, AlertTriangle } from "lucide-react";

const ScheduleChangeRequestModal = ({
  showModal,
  selectedClass,
  selectedDate,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    originalDate: "",
    requestedDate: "",
    startTime: "",
    endTime: "",
    reason: "",
    urgency: "medium",
  });
  const [maintenanceConflicts, setMaintenanceConflicts] = useState([]);
  const [scheduleConflicts, setScheduleConflicts] = useState([]);
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(false);
  const [isCheckingSchedule, setIsCheckingSchedule] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (showModal && selectedDate && !hasInitialized.current) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      setFormData({
        originalDate: `${year}-${month}-${day}`,
        requestedDate: "",
        startTime: "",
        endTime: "",
        reason: "",
        urgency: "medium",
      });
      hasInitialized.current = true;
    }

    if (!showModal) {
      hasInitialized.current = false;
      setFormData({
        originalDate: "",
        requestedDate: "",
        startTime: "",
        endTime: "",
        reason: "",
        urgency: "medium",
      });
      setMaintenanceConflicts([]);
      setScheduleConflicts([]);
    }
  }, [showModal, selectedDate]);

  // Check maintenance conflicts
  const checkMaintenanceConflicts = async (date, classData) => {
    if (!date || !classData) return [];

    try {
      setIsCheckingMaintenance(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/maintenance/check-conflicts`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            date: date,
            roomId: classData.roomId || classData.room?._id,
          },
        }
      );

      return response.data.conflicts || [];
    } catch (error) {
      console.error("Error checking maintenance conflicts:", error);
      return [];
    } finally {
      setIsCheckingMaintenance(false);
    }
  };

  // Check trainer schedule conflicts
  const checkTrainerScheduleConflicts = async (
    date,
    startTime,
    endTime,
    classData
  ) => {
    if (
      !date ||
      !startTime ||
      !endTime ||
      !classData ||
      !classData.instructorName
    )
      return [];

    try {
      setIsCheckingSchedule(true);
      const token = localStorage.getItem("token");

      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      const dayNames = [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ];

      console.log("🔍 Frontend check params:");
      console.log("  Date:", date);
      console.log("  Day of week:", dayOfWeek, "-", dayNames[dayOfWeek]);
      console.log("  Time:", startTime, "-", endTime);
      console.log("  Trainer:", classData.instructorName);

      const params = new URLSearchParams({
        trainerId: classData.instructorName,
        requestedDate: date,
        startTime: startTime,
        endTime: endTime,
      });

      console.log(
        "  API URL:",
        `http://localhost:5000/api/trainers/check-makeup-schedule-conflict?${params.toString()}`
      );

      const response = await axios.get(
        `http://localhost:5000/api/trainers/check-makeup-schedule-conflict?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("  Response:", response.data);

      return response.data.hasConflict ? response.data.conflicts : [];
    } catch (error) {
      console.error("Error checking trainer schedule conflicts:", error);
      return [];
    } finally {
      setIsCheckingSchedule(false);
    }
  };

  // Check conflicts when requested date or time changes
  useEffect(() => {
    if (formData.requestedDate && selectedClass) {
      checkMaintenanceConflicts(formData.requestedDate, selectedClass).then(
        (conflicts) => {
          setMaintenanceConflicts(conflicts);
        }
      );
    }

    console.log("🔄 useEffect triggered:", {
      date: formData.requestedDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      hasSelectedClass: !!selectedClass,
      instructorName: selectedClass?.instructorName,
    });

    if (
      formData.requestedDate &&
      formData.startTime &&
      formData.endTime &&
      selectedClass
    ) {
      console.log("✅ Calling checkTrainerScheduleConflicts...");
      checkTrainerScheduleConflicts(
        formData.requestedDate,
        formData.startTime,
        formData.endTime,
        selectedClass
      ).then((conflicts) => {
        console.log("✅ Received conflicts:", conflicts);
        setScheduleConflicts(conflicts);
      });
    } else {
      console.log("❌ Conditions not met, clearing conflicts");
      setScheduleConflicts([]);
    }
  }, [
    formData.requestedDate,
    formData.startTime,
    formData.endTime,
    selectedClass,
  ]);

  if (!showModal || !selectedClass) return null;

  // Date constraints
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const maxDateObj = new Date();
  maxDateObj.setFullYear(today.getFullYear() + 1);
  const maxDate = `${maxDateObj.getFullYear()}-${String(
    maxDateObj.getMonth() + 1
  ).padStart(2, "0")}-${String(maxDateObj.getDate()).padStart(2, "0")}`;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.originalDate ||
      !formData.requestedDate ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.reason.trim()
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      alert("Giờ kết thúc phải sau giờ bắt đầu!");
      return;
    }

    if (formData.reason.trim().length < 10) {
      alert("Lý do thay đổi phải có ít nhất 10 ký tự!");
      return;
    }

    if (formData.requestedDate < minDate) {
      alert("Không thể chọn ngày dạy bù trong quá khứ!");
      return;
    }

    // Check maintenance conflicts
    if (maintenanceConflicts.length > 0) {
      const conflictDetails = maintenanceConflicts
        .map(
          (m) =>
            `- ${m.title} (${m.maintenanceType}): ${new Date(
              m.scheduledDate
            ).toLocaleDateString("vi-VN")}`
        )
        .join("\n");

      alert(
        `⚠️ KHÔNG THỂ THAY ĐỔI LỊCH\n\nNgày bạn muốn dạy bù có lịch bảo trì:\n${conflictDetails}\n\nVui lòng chọn ngày khác hoặc liên hệ admin để được hỗ trợ.`
      );
      return;
    }

    // Check trainer schedule conflicts
    if (scheduleConflicts.length > 0) {
      const conflictDetails = scheduleConflicts
        .map((c) => {
          if (c.type === "regular_class") {
            return `- Lớp thường: ${c.conflictClass.className}\n  Thời gian: ${c.conflictSlot.dayName} (${c.conflictSlot.startTime} - ${c.conflictSlot.endTime})`;
          } else {
            return `- Lớp dạy bù: ${c.conflictClass.className}\n  Thời gian: ${c.conflictSlot.startTime} - ${c.conflictSlot.endTime}`;
          }
        })
        .join("\n\n");

      alert(
        `⚠️ TRÙNG LỊCH DẠY\n\n` +
          `Bạn đã có lịch dạy vào ngày ${new Date(
            formData.requestedDate
          ).toLocaleDateString("vi-VN")}:\n\n` +
          `${conflictDetails}\n\n` +
          `💡 Vui lòng:\n` +
          `• Chọn ngày khác không bị trùng lịch\n` +
          `• Hoặc liên hệ admin để sắp xếp lại lịch dạy`
      );
      return;
    }

    if (formData.requestedDate === formData.originalDate) {
      alert("Ngày dạy bù phải khác với ngày cần thay đổi!");
      return;
    }

    onSubmit({
      classId: selectedClass._id,
      originalDate: formData.originalDate,
      requestedDate: formData.requestedDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      reason: formData.reason.trim(),
      urgency: formData.urgency,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Đề xuất thay đổi lịch dạy
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Original Date */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-orange-800 mb-2">
                📅 Ngày cần thay đổi *
              </label>
              <input
                type="date"
                value={formData.originalDate}
                readOnly
                className="w-full px-3 py-2 border border-orange-300 rounded-lg bg-orange-100 text-gray-800 cursor-not-allowed"
              />
            </div>

            {/* Requested Date */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                🔄 Ngày mong muốn dạy bù *
              </label>
              <input
                type="date"
                value={formData.requestedDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    requestedDate: e.target.value,
                  }))
                }
                min={minDate}
                max={maxDate}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            {/* Time Selection */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-green-800 mb-2">
                🕒 Thời gian dạy bù *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-green-700 mb-1">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-green-700 mb-1">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                    required
                  />
                </div>
              </div>
              {formData.startTime &&
                formData.endTime &&
                formData.startTime >= formData.endTime && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Giờ kết thúc phải sau giờ bắt đầu
                  </p>
                )}

              {/* Checking Indicators */}
              {(isCheckingMaintenance || isCheckingSchedule) && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-center">
                    <span className="animate-spin mr-2">🔄</span>
                    Đang kiểm tra lịch...
                  </p>
                </div>
              )}

              {/* Maintenance Conflicts Warning */}
              {!isCheckingMaintenance && maintenanceConflicts.length > 0 && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">
                        ⚠️ Có lịch bảo trì trong ngày này!
                      </p>
                      <ul className="text-xs text-red-700 space-y-1">
                        {maintenanceConflicts.map((maintenance, index) => (
                          <li key={index}>
                            • {maintenance.title} ({maintenance.maintenanceType}
                            )
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        → Không thể thay đổi lịch. Vui lòng chọn ngày khác!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Conflicts Warning */}
              {!isCheckingSchedule && scheduleConflicts.length > 0 && (
                <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 mb-2">
                        ⚠️ Trùng lịch dạy!
                      </p>
                      <div className="text-xs text-red-700 space-y-2">
                        <p className="font-semibold">
                          Bạn đã có {scheduleConflicts.length} lịch dạy vào ngày
                          này:
                        </p>
                        {scheduleConflicts.map((conflict, index) => (
                          <div
                            key={index}
                            className="pl-3 py-2 bg-red-100 rounded"
                          >
                            {conflict.type === "regular_class" ? (
                              <>
                                <p className="font-medium">
                                  📚 Lớp thường:{" "}
                                  {conflict.conflictClass.className}
                                </p>
                                <p className="mt-1 text-red-800">
                                  🕒 {conflict.conflictSlot.dayName}:{" "}
                                  {conflict.conflictSlot.startTime} -{" "}
                                  {conflict.conflictSlot.endTime}
                                </p>
                                {conflict.requestedTime && (
                                  <p className="mt-1 text-red-700">
                                    🔄 Lịch muốn đổi:{" "}
                                    {conflict.requestedTime.startTime} -{" "}
                                    {conflict.requestedTime.endTime}
                                  </p>
                                )}
                                {conflict.overlapMinutes && (
                                  <p className="mt-1 text-red-600 font-semibold">
                                    ⚠️ Trùng {conflict.overlapMinutes} phút
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <p className="font-medium">
                                  🔄 Lớp dạy bù:{" "}
                                  {conflict.conflictClass.className}
                                </p>
                                <p className="mt-1 text-red-800">
                                  🕒 Lịch hiện tại:{" "}
                                  {conflict.conflictSlot.startTime} -{" "}
                                  {conflict.conflictSlot.endTime}
                                </p>
                                {conflict.requestedTime && (
                                  <p className="mt-1 text-red-700">
                                    🔄 Lịch muốn đổi:{" "}
                                    {conflict.requestedTime.startTime} -{" "}
                                    {conflict.requestedTime.endTime}
                                  </p>
                                )}
                                {conflict.overlapMinutes && (
                                  <p className="mt-1 text-red-600 font-semibold">
                                    ⚠️ Trùng {conflict.overlapMinutes} phút
                                  </p>
                                )}
                                {conflict.conflictSlot.location && (
                                  <p className="text-xs text-red-600 mt-1">
                                    📍 {conflict.conflictSlot.location}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-red-600 mt-2 font-medium">
                        💡 Vui lòng chọn ngày khác không bị trùng lịch!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {!isCheckingMaintenance &&
                !isCheckingSchedule &&
                maintenanceConflicts.length === 0 &&
                scheduleConflicts.length === 0 &&
                formData.requestedDate && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 flex items-center">
                      ✅ Ngày này không có xung đột lịch dạy
                    </p>
                  </div>
                )}
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ khẩn cấp
              </label>
              <select
                value={formData.urgency}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, urgency: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🟢 Thấp</option>
                <option value="medium">🟡 Trung bình</option>
                <option value="high">🟠 Cao</option>
                <option value="urgent">🔴 Khẩn cấp</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do thay đổi lịch *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={4}
                maxLength={500}
                placeholder="Vui lòng mô tả chi tiết lý do cần thay đổi lịch dạy (tối thiểu 10 ký tự)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Tối thiểu 10 ký tự</span>
                <span>{formData.reason.length}/500</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={
                  maintenanceConflicts.length > 0 ||
                  scheduleConflicts.length > 0 ||
                  isCheckingMaintenance ||
                  isCheckingSchedule ||
                  (formData.startTime &&
                    formData.endTime &&
                    formData.startTime >= formData.endTime)
                }
                className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                  maintenanceConflicts.length > 0 ||
                  scheduleConflicts.length > 0 ||
                  isCheckingMaintenance ||
                  isCheckingSchedule ||
                  (formData.startTime &&
                    formData.endTime &&
                    formData.startTime >= formData.endTime)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <Send className="h-4 w-4 mr-2" />
                Gửi đề xuất
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleChangeRequestModal;
