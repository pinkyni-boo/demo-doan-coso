import Club from "../models/Club.js";

// Lấy tất cả CLB
export const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find();
    res.status(200).json(clubs);
  } catch (error) {
    console.error("Error fetching clubs:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách CLB",
      error: error.message,
    });
  }
};

// Thêm CLB mới
export const createClub = async (req, res) => {
  try {
    const { name, address, image, description } = req.body;

    // Validate input
    if (!name || !address || !image || !description) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin CLB",
      });
    }

    const newClub = new Club({ name, address, image, description });
    const savedClub = await newClub.save();

    res.status(201).json({
      message: "Thêm CLB thành công",
      club: savedClub,
    });
  } catch (error) {
    console.error("Error creating club:", error);
    res.status(500).json({
      message: "Lỗi khi thêm CLB",
      error: error.message,
    });
  }
};

// Cập nhật CLB
export const updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, image, description } = req.body;

    // Validate input
    if (!name || !address || !image || !description) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin CLB",
      });
    }

    const updatedClub = await Club.findByIdAndUpdate(
      id,
      { name, address, image, description },
      { new: true, runValidators: true }
    );

    if (!updatedClub) {
      return res.status(404).json({ message: "CLB không tồn tại" });
    }

    res.status(200).json({
      message: "Cập nhật CLB thành công",
      club: updatedClub,
    });
  } catch (error) {
    console.error("Error updating club:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật CLB",
      error: error.message,
    });
  }
};

// Xóa CLB
export const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClub = await Club.findByIdAndDelete(id);

    if (!deletedClub) {
      return res.status(404).json({ message: "CLB không tồn tại" });
    }

    res.status(200).json({
      message: "CLB đã được xóa thành công",
    });
  } catch (error) {
    console.error("Error deleting club:", error);
    res.status(500).json({
      message: "Lỗi khi xóa CLB",
      error: error.message,
    });
  }
};
