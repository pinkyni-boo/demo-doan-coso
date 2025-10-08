import Room from "../models/Room.js";
import Equipment from "../models/Equipment.js";
import Class from "../models/Class.js";
import ScheduleChangeRequest from "../models/ScheduleChangeRequest.js";

// Lấy danh sách tất cả phòng tập
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("equipment", "name category status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách phòng tập thành công",
      data: rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phòng tập",
      error: error.message,
    });
  }
};

// Lấy thông tin chi tiết một phòng tập
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate("equipment", "name category status purchaseDate warrantyExpiry")
      .populate("reportHistory.reportedBy", "fullName email")
      .populate("reportHistory.resolvedBy", "fullName email");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng tập",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin phòng tập thành công",
      data: room,
    });
  } catch (error) {
    console.error("Error fetching room by ID:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin phòng tập",
      error: error.message,
    });
  }
};

// Tạo phòng tập mới
const createRoom = async (req, res) => {
  try {
    const {
      roomName,
      roomCode,
      location,
      capacity,
      area,
      status = "active",
      facilities,
      description,
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!roomName || !roomCode || !location || !capacity || !area) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng cung cấp đầy đủ thông tin: tên phòng, mã phòng, vị trí, sức chứa và diện tích",
      });
    }

    // Kiểm tra mã phòng đã tồn tại
    const existingRoom = await Room.findOne({ roomCode });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Mã phòng đã tồn tại trong hệ thống",
      });
    }

    // Tạo phòng tập mới
    const newRoom = new Room({
      roomName,
      roomCode,
      location,
      capacity: parseInt(capacity),
      area: parseFloat(area),
      status,
      facilities: Array.isArray(facilities) ? facilities : [],
      description: description || "",
    });

    const savedRoom = await newRoom.save();

    res.status(201).json({
      success: true,
      message: "Tạo phòng tập thành công",
      data: savedRoom,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo phòng tập",
      error: error.message,
    });
  }
};

// Cập nhật thông tin phòng tập
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Nếu có mã phòng mới, kiểm tra không trùng
    if (updateData.roomCode) {
      const existingRoom = await Room.findOne({
        roomCode: updateData.roomCode,
        _id: { $ne: id },
      });

      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: "Mã phòng đã tồn tại trong hệ thống",
        });
      }
    }

    // Xử lý capacity và area
    if (updateData.capacity) {
      updateData.capacity = parseInt(updateData.capacity);
    }
    if (updateData.area) {
      updateData.area = parseFloat(updateData.area);
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng tập",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật phòng tập thành công",
      data: updatedRoom,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật phòng tập",
      error: error.message,
    });
  }
};

// Xóa phòng tập
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra phòng có thiết bị không
    const equipmentCount = await Equipment.countDocuments({ room: id });
    if (equipmentCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xóa phòng tập vì vẫn còn thiết bị trong phòng. Vui lòng di chuyển hoặc xóa thiết bị trước.",
      });
    }

    const deletedRoom = await Room.findByIdAndDelete(id);

    if (!deletedRoom) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng tập",
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa phòng tập thành công",
      data: deletedRoom,
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa phòng tập",
      error: error.message,
    });
  }
};

// Thêm báo cáo cho phòng tập
const addRoomReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, notes } = req.body;
    const reportedBy = req.user.userId;

    if (!condition) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tình trạng phòng tập",
      });
    }

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng tập",
      });
    }

    // Thêm báo cáo mới
    const newReport = {
      condition,
      notes: notes || "",
      reportedBy,
      reportDate: new Date(),
    };

    room.reportHistory.push(newReport);
    room.currentCondition = condition;
    room.lastInspectedBy = reportedBy;
    room.lastInspectedAt = new Date();

    await room.save();

    const updatedRoom = await Room.findById(id).populate(
      "reportHistory.reportedBy",
      "fullName email"
    );

    res.status(200).json({
      success: true,
      message: "Thêm báo cáo thành công",
      data: updatedRoom,
    });
  } catch (error) {
    console.error("Error adding room report:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm báo cáo",
      error: error.message,
    });
  }
};

// Lấy thiết bị trong phòng
const getRoomEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng tập",
      });
    }

    const equipment = await Equipment.find({ room: id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách thiết bị thành công",
      data: {
        room: room,
        equipment: equipment,
      },
    });
  } catch (error) {
    console.error("Error fetching room equipment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách thiết bị",
      error: error.message,
    });
  }
};

// Thống kê phòng tập
const getRoomStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const activeRooms = await Room.countDocuments({ status: "active" });
    const maintenanceRooms = await Room.countDocuments({
      status: "maintenance",
    });
    const inactiveRooms = await Room.countDocuments({ status: "inactive" });

    // Thống kê theo điều kiện
    const conditionStats = await Room.aggregate([
      {
        $group: {
          _id: "$currentCondition",
          count: { $sum: 1 },
        },
      },
    ]);

    // Thống kê diện tích
    const areaStats = await Room.aggregate([
      {
        $group: {
          _id: null,
          totalArea: { $sum: "$area" },
          averageArea: { $avg: "$area" },
          minArea: { $min: "$area" },
          maxArea: { $max: "$area" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Lấy thống kê phòng tập thành công",
      data: {
        summary: {
          totalRooms,
          activeRooms,
          maintenanceRooms,
          inactiveRooms,
        },
        conditions: conditionStats,
        area: areaStats[0] || {
          totalArea: 0,
          averageArea: 0,
          minArea: 0,
          maxArea: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching room stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê",
      error: error.message,
    });
  }
};

// Kiểm tra phòng trống cho lịch dạy bù
const getAvailableRooms = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin: date, startTime, endTime",
      });
    }

    // Chuyển đổi date string thành Date object
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ...

    // Map day numbers to Vietnamese day names used in schedule
    const dayMapping = {
      0: ["CN", "Chủ nhật"],
      1: ["T2", "Thứ 2", "Thứ hai"],
      2: ["T3", "Thứ 3", "Thứ ba"],
      3: ["T4", "Thứ 4", "Thứ tư"],
      4: ["T5", "Thứ 5", "Thứ năm"],
      5: ["T6", "Thứ 6", "Thứ sáu"],
      6: ["T7", "Thứ 7", "Thứ bảy"],
    };

    // Lấy tất cả phòng active
    const allRooms = await Room.find({ status: "active" }).sort({
      roomName: 1,
    });

    // Lấy tất cả lớp học đang hoạt động trong ngày đó
    const activeClasses = await Class.find({
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate },
      status: "active",
    });

    // Lấy tất cả lịch dạy bù đã được tạo cho ngày đó
    const makeupSchedules = await ScheduleChangeRequest.find({
      "makeupSchedule.date": {
        $gte: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate()
        ),
        $lt: new Date(
          targetDate.getFullYear(),
          targetDate.getMonth(),
          targetDate.getDate() + 1
        ),
      },
      status: "approved",
    });

    // Function để kiểm tra xung đột thời gian
    const isTimeConflict = (start1, end1, start2, end2) => {
      return start1 < end2 && end1 > start2;
    };

    // Function để parse time string thành minutes
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const requestStartMinutes = timeToMinutes(startTime);
    const requestEndMinutes = timeToMinutes(endTime);

    // Kiểm tra từng phòng
    const availableRooms = [];
    const conflictRooms = [];

    for (const room of allRooms) {
      let isAvailable = true;
      const conflicts = [];

      // Kiểm tra xung đột với lớp học thường
      for (const classItem of activeClasses) {
        if (
          classItem.location === room.roomName ||
          classItem.location === room.roomCode
        ) {
          // Kiểm tra xem lớp có diễn ra trong ngày đó không
          const schedule = classItem.schedule;
          if (schedule) {
            const dayNames = dayMapping[dayOfWeek];
            const hasScheduleOnDay = dayNames.some((dayName) =>
              schedule.toLowerCase().includes(dayName.toLowerCase())
            );

            if (hasScheduleOnDay) {
              // Parse thời gian từ schedule (format: "T2,T4 - 19:00-21:00")
              const timePart = schedule.split(" - ")[1];
              if (timePart) {
                const [classStart, classEnd] = timePart.split("-");
                const classStartMinutes = timeToMinutes(classStart);
                const classEndMinutes = timeToMinutes(classEnd);

                if (
                  isTimeConflict(
                    requestStartMinutes,
                    requestEndMinutes,
                    classStartMinutes,
                    classEndMinutes
                  )
                ) {
                  isAvailable = false;
                  conflicts.push({
                    type: "class",
                    name: classItem.className,
                    time: `${classStart}-${classEnd}`,
                    instructor: classItem.instructorName,
                  });
                }
              }
            }
          }
        }
      }

      // Kiểm tra xung đột với lịch dạy bù
      for (const makeupRequest of makeupSchedules) {
        if (
          makeupRequest.makeupSchedule &&
          makeupRequest.makeupSchedule.location === room.roomName
        ) {
          const makeupStart = timeToMinutes(
            makeupRequest.makeupSchedule.startTime
          );
          const makeupEnd = timeToMinutes(makeupRequest.makeupSchedule.endTime);

          if (
            isTimeConflict(
              requestStartMinutes,
              requestEndMinutes,
              makeupStart,
              makeupEnd
            )
          ) {
            isAvailable = false;
            conflicts.push({
              type: "makeup",
              name: "Lịch dạy bù",
              time: `${makeupRequest.makeupSchedule.startTime}-${makeupRequest.makeupSchedule.endTime}`,
              instructor: "HLV khác",
            });
          }
        }
      }

      if (isAvailable) {
        availableRooms.push({
          _id: room._id,
          roomName: room.roomName,
          roomCode: room.roomCode,
          location: room.location,
          capacity: room.capacity,
          facilities: room.facilities,
        });
      } else {
        conflictRooms.push({
          _id: room._id,
          roomName: room.roomName,
          roomCode: room.roomCode,
          conflicts: conflicts,
        });
      }
    }

    res.json({
      success: true,
      message: `Tìm thấy ${availableRooms.length} phòng trống`,
      data: {
        availableRooms,
        conflictRooms,
        searchParams: {
          date,
          startTime,
          endTime,
          dayOfWeek: dayMapping[dayOfWeek][0],
        },
      },
    });
  } catch (error) {
    console.error("Error checking room availability:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra phòng trống",
      error: error.message,
    });
  }
};

export {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  addRoomReport,
  getRoomEquipment,
  getRoomStats,
  getAvailableRooms,
};
