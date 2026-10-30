import UserModel from "../models/user.model.js";
import TeacherModel from "../models/teacher.model.js";
import TeacherPositionModel from "../models/teacherPosition.model.js";

// Hàm sinh mã giáo viên ngẫu nhiên gồm 10 chữ số và không trùng lặp
const generateUniqueTeacherCode = async () => {
  let isUnique = false;
  let code = "";

  while (!isUnique) {
    // Sinh số ngẫu nhiên 10 chữ số từ 1000000000 đến 9999999999
    code = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const existing = await TeacherModel.findOne({ code });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

// 1.1 + 1.2: Lấy danh sách toàn bộ thông tin giáo viên và hỗ trợ phân trang
export const getTeachers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : "";

    let userIdsMatchingSearch = [];
    let positionIdsMatchingSearch = [];

    if (search) {
      // Tìm kiếm theo tên, email, sđt, địa chỉ hoặc CCCD
      const matchedUsers = await UserModel.find({
        isDeleted: false,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
          { identity: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      userIdsMatchingSearch = matchedUsers.map((u) => u._id);

      // Tìm kiếm theo tên hoặc mã vị trí công tác
      const matchedPositions = await TeacherPositionModel.find({
        isDeleted: false,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      positionIdsMatchingSearch = matchedPositions.map((p) => p._id);
    }

    // Điều kiện lọc giáo viên
    const query = {
      isDeleted: false,
    };

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { userId: { $in: userIdsMatchingSearch } },
        { teacherPositionsId: { $in: positionIdsMatchingSearch } },
        { "degrees.major": { $regex: search, $options: "i" } },
        { "degrees.school": { $regex: search, $options: "i" } },
      ];
    }

    const total = await TeacherModel.countDocuments(query);

    const teachers = await TeacherModel.find(query)
      .populate("userId", "name email phoneNumber address identity dob role avatar")
      .populate("teacherPositionsId", "name code des isActive")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Chuẩn hóa dữ liệu trả về cho Frontend hiển thị rõ ràng và tiện lợi
    const formattedTeachers = teachers.map((teacher) => {
      const user = teacher.userId || {};
      const positions = teacher.teacherPositionsId || [];
      const highestDegree =
        teacher.degrees && teacher.degrees.length > 0
          ? teacher.degrees[teacher.degrees.length - 1]
          : null;

      return {
        _id: teacher._id,
        code: teacher.code,
        isActive: teacher.isActive,
        startDate: teacher.startDate,
        endDate: teacher.endDate,
        // Thông tin người dùng
        userId: user._id,
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        identity: user.identity || "",
        dob: user.dob || null,
        avatar: user.avatar || "",
        // Vị trí công tác
        teacherPositions: positions,
        positionNames: positions.map((p) => p.name).join(", "),
        // Học vị
        degrees: teacher.degrees || [],
        highestDegree: highestDegree
          ? {
              type: highestDegree.type,
              school: highestDegree.school,
              major: highestDegree.major,
              year: highestDegree.year,
              isGraduated: highestDegree.isGraduated,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách giáo viên thành công",
      data: formattedTeachers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Lỗi getTeachers:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách giáo viên",
      error: error.message,
    });
  }
};

// 1.3: Tạo mới thông tin 1 giáo viên (hỗ trợ cả JSON và form-data từ Postman)
export const createTeacher = async (req, res) => {
  try {
    let {
      name,
      email,
      phoneNumber,
      address,
      identity,
      dob,
      avatar,
      startDate,
      endDate,
      teacherPositionsId,
      degrees,
      isActive,
    } = req.body;

    // Nếu gửi file ảnh qua form-data trên Postman (key: avatar / img / file)
    if (req.files && req.files.length > 0) {
      const f = req.files[0];
      avatar = `data:${f.mimetype};base64,${f.buffer.toString("base64")}`;
    }

    // Hỗ trợ parse JSON nếu gửi mảng dưới dạng string trong form-data
    if (typeof teacherPositionsId === "string" && teacherPositionsId.trim().startsWith("[")) {
      try {
        teacherPositionsId = JSON.parse(teacherPositionsId);
      } catch (_) {}
    }
    if (typeof degrees === "string" && degrees.trim().startsWith("[")) {
      try {
        degrees = JSON.parse(degrees);
      } catch (_) {}
    }
    if (typeof isActive === "string") {
      isActive = isActive === "true";
    }

    // Validate bắt buộc
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Họ tên và email là thông tin bắt buộc!",
      });
    }

    // Kiểm tra email duy nhất (trong các user chưa bị xóa)
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser && !existingUser.isDeleted) {
      return res.status(400).json({
        success: false,
        message: `Email '${email}' đã tồn tại trong hệ thống! Vui lòng chọn email khác.`,
      });
    }
    if (existingUser && existingUser.isDeleted) {
      await UserModel.findByIdAndDelete(existingUser._id);
    }

    // 1. Tạo bản ghi User trước
    const newUser = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber ? phoneNumber.trim() : "",
      address: address ? address.trim() : "",
      identity: identity ? identity.trim() : "",
      dob: dob ? new Date(dob) : null,
      avatar: avatar || "",
      role: "TEACHER",
    });

    // 2. Sinh mã giáo viên ngẫu nhiên gồm 10 chữ số (unique)
    const code = await generateUniqueTeacherCode();

    // 3. Tạo bản ghi Teacher
    const newTeacher = await TeacherModel.create({
      userId: newUser._id,
      code,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      teacherPositionsId: Array.isArray(teacherPositionsId)
        ? teacherPositionsId
        : teacherPositionsId
        ? [teacherPositionsId]
        : [],
      degrees: Array.isArray(degrees) ? degrees : [],
      isActive: isActive !== undefined ? isActive : true,
    });

    // Populate dữ liệu vừa tạo để trả về
    const populatedTeacher = await TeacherModel.findById(newTeacher._id)
      .populate("userId", "name email phoneNumber address identity dob role avatar")
      .populate("teacherPositionsId", "name code des isActive");

    return res.status(201).json({
      success: true,
      message: "Tạo thông tin giáo viên thành công!",
      data: populatedTeacher,
    });
  } catch (error) {
    console.error("Lỗi createTeacher:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi tạo giáo viên",
      error: error.message,
    });
  }
};

// 1.6: Cập nhật thông tin giáo viên / Thăng chức vị trí công tác mới
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      name,
      email,
      phoneNumber,
      address,
      identity,
      dob,
      avatar,
      startDate,
      endDate,
      teacherPositionsId,
      degrees,
      isActive,
    } = req.body;

    // Nếu gửi file ảnh qua form-data trên Postman
    if (req.files && req.files.length > 0) {
      const f = req.files[0];
      avatar = `data:${f.mimetype};base64,${f.buffer.toString("base64")}`;
    }

    if (typeof teacherPositionsId === "string" && teacherPositionsId.trim().startsWith("[")) {
      try {
        teacherPositionsId = JSON.parse(teacherPositionsId);
      } catch (_) {}
    }
    if (typeof degrees === "string" && degrees.trim().startsWith("[")) {
      try {
        degrees = JSON.parse(degrees);
      } catch (_) {}
    }
    if (typeof isActive === "string") {
      isActive = isActive === "true";
    }

    const teacher = await TeacherModel.findOne({ _id: id, isDeleted: false });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giáo viên cần cập nhật!",
      });
    }

    // Cập nhật thông tin User liên kết
    if (teacher.userId) {
      const user = await UserModel.findById(teacher.userId);
      if (user) {
        if (email && email.toLowerCase().trim() !== user.email) {
          const emailExists = await UserModel.findOne({
            email: email.toLowerCase().trim(),
            _id: { $ne: user._id },
            isDeleted: false,
          });
          if (emailExists) {
            return res.status(400).json({
              success: false,
              message: `Email '${email}' đã được sử dụng bởi giáo viên khác!`,
            });
          }
          user.email = email.toLowerCase().trim();
        }
        if (name !== undefined) user.name = name.trim();
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
        if (address !== undefined) user.address = address.trim();
        if (identity !== undefined) user.identity = identity.trim();
        if (dob !== undefined) user.dob = dob ? new Date(dob) : null;
        if (avatar !== undefined) user.avatar = avatar;
        await user.save();
      }
    }

    // Cập nhật thông tin Teacher (bao gồm vị trí công tác mới / thăng chức)
    if (startDate !== undefined) {
      teacher.startDate = startDate ? new Date(startDate) : teacher.startDate;
    }
    if (endDate !== undefined) {
      teacher.endDate = endDate ? new Date(endDate) : null;
    }
    if (teacherPositionsId !== undefined) {
      teacher.teacherPositionsId = Array.isArray(teacherPositionsId)
        ? teacherPositionsId
        : teacherPositionsId
        ? [teacherPositionsId]
        : [];
    }
    if (degrees !== undefined && Array.isArray(degrees)) {
      teacher.degrees = degrees;
    }
    if (isActive !== undefined) {
      teacher.isActive = isActive;
    }

    await teacher.save();

    const populatedTeacher = await TeacherModel.findById(teacher._id)
      .populate("userId", "name email phoneNumber address identity dob role avatar")
      .populate("teacherPositionsId", "name code des isActive");

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin & chức vụ giáo viên thành công!",
      data: populatedTeacher,
    });
  } catch (error) {
    console.error("Lỗi updateTeacher:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi cập nhật giáo viên",
      error: error.message,
    });
  }
};

// 1.7: Xóa thông tin giáo viên (Soft Delete)
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await TeacherModel.findOne({ _id: id, isDeleted: false });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giáo viên cần xóa!",
      });
    }

    teacher.isDeleted = true;
    await teacher.save();

    if (teacher.userId) {
      await UserModel.findByIdAndUpdate(teacher.userId, { isDeleted: true });
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa giáo viên thành công!",
    });
  } catch (error) {
    console.error("Lỗi deleteTeacher:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi xóa giáo viên",
      error: error.message,
    });
  }
};
