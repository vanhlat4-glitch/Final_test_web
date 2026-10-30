import TeacherPositionModel from "../models/teacherPosition.model.js";
import TeacherModel from "../models/teacher.model.js";

// 1.4: Lấy danh sách toàn bộ thông tin vị trí công tác (hỗ trợ tìm kiếm)
export const getTeacherPositions = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim() : "";
    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { des: { $regex: search, $options: "i" } },
      ];
    }

    const positions = await TeacherPositionModel.find(query).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách vị trí công tác thành công",
      data: positions,
    });
  } catch (error) {
    console.error("Lỗi getTeacherPositions:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy vị trí công tác",
      error: error.message,
    });
  }
};

// 1.5: Tạo mới thông tin vị trí công tác (code là duy nhất, hỗ trợ bổ nhiệm giáo viên cũ lên chức mới)
export const createTeacherPosition = async (req, res) => {
  try {
    const { code, name, des, isActive, teacherIds, replaceOldPositions } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: "Mã vị trí (code) và Tên vị trí (name) là bắt buộc!",
      });
    }

    // Kiểm tra code duy nhất
    const existingPosition = await TeacherPositionModel.findOne({
      code: code.trim().toUpperCase(),
    });

    if (existingPosition && !existingPosition.isDeleted) {
      return res.status(400).json({
        success: false,
        message: `Mã vị trí '${code}' đã tồn tại! Vui lòng chọn mã khác.`,
      });
    }
    if (existingPosition && existingPosition.isDeleted) {
      await TeacherPositionModel.findByIdAndDelete(existingPosition._id);
    }

    const newPosition = await TeacherPositionModel.create({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      des: des ? des.trim() : "",
      isActive: isActive !== undefined ? isActive : true,
    });

    // Nếu có chọn nhân viên/giáo viên cũ để thăng chức lên vị trí mới này
    if (Array.isArray(teacherIds) && teacherIds.length > 0) {
      if (replaceOldPositions) {
        await TeacherModel.updateMany(
          { _id: { $in: teacherIds } },
          { $set: { teacherPositionsId: [newPosition._id] } }
        );
      } else {
        await TeacherModel.updateMany(
          { _id: { $in: teacherIds } },
          { $addToSet: { teacherPositionsId: newPosition._id } }
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Tạo mới vị trí công tác thành công!",
      data: newPosition,
    });
  } catch (error) {
    console.error("Lỗi createTeacherPosition:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi tạo vị trí công tác",
      error: error.message,
    });
  }
};

// Cập nhật vị trí công tác & bổ nhiệm giáo viên lên vị trí này
export const updateTeacherPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, des, isActive, teacherIds, replaceOldPositions } = req.body;

    const position = await TeacherPositionModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vị trí công tác cần cập nhật!",
      });
    }

    if (code && code.trim().toUpperCase() !== position.code) {
      const duplicate = await TeacherPositionModel.findOne({
        code: code.trim().toUpperCase(),
        _id: { $ne: id },
        isDeleted: false,
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Mã vị trí '${code}' đã tồn tại!`,
        });
      }
      position.code = code.trim().toUpperCase();
    }

    if (name !== undefined) position.name = name.trim();
    if (des !== undefined) position.des = des.trim();
    if (isActive !== undefined) position.isActive = isActive;

    await position.save();

    // Nếu có chọn nhân viên/giáo viên cũ để bổ nhiệm/thăng chức lên vị trí này
    if (Array.isArray(teacherIds) && teacherIds.length > 0) {
      if (replaceOldPositions) {
        await TeacherModel.updateMany(
          { _id: { $in: teacherIds } },
          { $set: { teacherPositionsId: [position._id] } }
        );
      } else {
        await TeacherModel.updateMany(
          { _id: { $in: teacherIds } },
          { $addToSet: { teacherPositionsId: position._id } }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật vị trí công tác thành công!",
      data: position,
    });
  } catch (error) {
    console.error("Lỗi updateTeacherPosition:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi cập nhật vị trí công tác",
      error: error.message,
    });
  }
};

// Xóa vị trí công tác
export const deleteTeacherPosition = async (req, res) => {
  try {
    const { id } = req.params;

    const position = await TeacherPositionModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vị trí công tác cần xóa!",
      });
    }

    position.isDeleted = true;
    await position.save();

    return res.status(200).json({
      success: true,
      message: "Đã xóa vị trí công tác thành công!",
    });
  } catch (error) {
    console.error("Lỗi deleteTeacherPosition:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi xóa vị trí công tác",
      error: error.message,
    });
  }
};
