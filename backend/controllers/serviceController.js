import Service from "../models/Service.js";

// Lấy danh sách tất cả dịch vụ
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách dịch vụ." });
  }
};

// Thêm dịch vụ mới
export const createService = async (req, res) => {
  try {
    const newService = new Service(req.body);
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi tạo dịch vụ." });
  }
};

// Cập nhật dịch vụ theo ID
export const updateService = async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi cập nhật dịch vụ." });
  }
};

// Xóa dịch vụ theo ID
export const deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa dịch vụ thành công." });
  } catch (err) {
    res.status(400).json({ error: "Lỗi khi xóa dịch vụ." });
  }
};
