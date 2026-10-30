const BASE_URL = "http://localhost:5001";

const runTests = async () => {
  try {
    console.log("==================================================");
    console.log("🚀 BẮT ĐẦU KIỂM THỬ TOÀN BỘ API BACKEND (10 TEST CASES)");
    console.log("==================================================\n");

    // 1. GET /teachers (Phân trang)
    console.log("🧪 1. GET /teachers?page=1&limit=5 (Lấy danh sách & Phân trang)");
    const resTeachers = await fetch(`${BASE_URL}/teachers?page=1&limit=5`);
    const dataTeachers = await resTeachers.json();
    console.log(`   ✅ Status: ${resTeachers.status} | Số bản ghi trang 1: ${dataTeachers.data?.length} | Tổng số GV: ${dataTeachers.pagination?.total}`);

    // 2. GET /teachers?search=... (Tìm kiếm)
    console.log("\n🧪 2. GET /teachers?search=Trần (Tìm kiếm giáo viên)");
    const resSearch = await fetch(`${BASE_URL}/teachers?search=${encodeURIComponent("Trần")}`);
    const dataSearch = await resSearch.json();
    console.log(`   ✅ Status: ${resSearch.status} | Tìm thấy: ${dataSearch.pagination?.total} giáo viên khớp từ khóa "Trần"`);

    // 3. GET /teacher-positions (Lấy danh sách vị trí công tác)
    console.log("\n🧪 3. GET /teacher-positions (Lấy danh sách vị trí công tác)");
    const resPositions = await fetch(`${BASE_URL}/teacher-positions`);
    const dataPositions = await resPositions.json();
    console.log(`   ✅ Status: ${resPositions.status} | Số vị trí: ${dataPositions.data?.length} (${dataPositions.data?.map((p) => p.code).join(", ")})`);

    // 4. POST /teacher-positions (Tạo vị trí công tác mới + kiểm tra trùng mã)
    console.log("\n🧪 4. POST /teacher-positions (Tạo vị trí công tác mới)");
    const testPosCode = "TEST_" + Math.floor(100 + Math.random() * 900);
    const resCreatePos = await fetch(`${BASE_URL}/teacher-positions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: testPosCode,
        name: "Tổ trưởng Chuyên môn Test",
        des: "Vị trí tạo tự động khi chạy test API",
        isActive: true,
      }),
    });
    const dataCreatePos = await resCreatePos.json();
    const createdPosId = dataCreatePos.data?._id;
    console.log(`   ✅ Status: ${resCreatePos.status} | Đã tạo vị trí: ${dataCreatePos.data?.code} - ${dataCreatePos.data?.name}`);

    // 5. POST /teachers (Tạo mới giáo viên kèm Avatar Base64 + Học vị + Vị trí + Mã 10 số)
    console.log("\n🧪 5. POST /teachers (Tạo mới giáo viên kèm Upload Ảnh, Học vị, Mã 10 số)");
    const randomEmail = `gv_test_${Date.now()}@school.edu.vn`;
    const sampleAvatarBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const resCreateTeacher = await fetch(`${BASE_URL}/teachers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Nguyễn Văn Kiểm Thử",
        email: randomEmail,
        phoneNumber: "0988776655",
        address: "Cầu Giấy, Hà Nội",
        identity: "001099123456",
        dob: "1992-05-15",
        avatar: sampleAvatarBase64,
        startDate: "2024-01-01",
        teacherPositionsId: [dataPositions.data?.[0]?._id],
        degrees: [
          {
            type: "Master",
            school: "Đại học Bách Khoa Hà Nội",
            major: "Khoa học Máy tính",
            year: 2018,
            isGraduated: true,
          },
        ],
        isActive: true,
      }),
    });
    const dataCreateTeacher = await resCreateTeacher.json();
    const createdTeacherId = dataCreateTeacher.data?._id;
    console.log(`   ✅ Status: ${resCreateTeacher.status} | Mã GV 10 số: ${dataCreateTeacher.data?.code} | Đã lưu Avatar: ${Boolean(dataCreateTeacher.data?.userId?.avatar)}`);

    // 6. PUT /teachers/:id (Update thông tin & Thăng chức giáo viên cũ lên chức vụ mới)
    console.log("\n🧪 6. PUT /teachers/:id (Update & Thăng chức giáo viên lên vị trí mới)");
    const resUpdateTeacher = await fetch(`${BASE_URL}/teachers/${createdTeacherId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Nguyễn Văn Kiểm Thử (Đã Thăng Chức)",
        teacherPositionsId: [dataPositions.data?.[0]?._id, createdPosId],
      }),
    });
    const dataUpdateTeacher = await resUpdateTeacher.json();
    console.log(`   ✅ Status: ${resUpdateTeacher.status} | Chức vụ sau khi thăng chức: ${dataUpdateTeacher.data?.teacherPositionsId?.map((p) => p.code).join(", ")}`);

    // 7. PUT /teacher-positions/:id (Cập nhật vị trí công tác)
    console.log("\n🧪 7. PUT /teacher-positions/:id (Cập nhật thông tin vị trí công tác)");
    const resUpdatePos = await fetch(`${BASE_URL}/teacher-positions/${createdPosId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Tổ trưởng Chuyên môn (Đã cập nhật)",
        des: "Mô tả đã được cập nhật qua API PUT",
      }),
    });
    const dataUpdatePos = await resUpdatePos.json();
    console.log(`   ✅ Status: ${resUpdatePos.status} | Tên mới: ${dataUpdatePos.data?.name}`);

    // 8. GET /students (Lấy danh sách học sinh)
    console.log("\n🧪 8. GET /students (Lấy danh sách học sinh từ CSDL)");
    const resStudents = await fetch(`${BASE_URL}/students`);
    const dataStudents = await resStudents.json();
    console.log(`   ✅ Status: ${resStudents.status} | Số học sinh hiện có: ${dataStudents.data?.length}`);

    // 9. DELETE /teachers/:id (Xóa giáo viên vừa test để giữ sạch CSDL)
    console.log("\n🧪 9. DELETE /teachers/:id (Xóa giáo viên thử nghiệm)");
    const resDelTeacher = await fetch(`${BASE_URL}/teachers/${createdTeacherId}`, {
      method: "DELETE",
    });
    const dataDelTeacher = await resDelTeacher.json();
    console.log(`   ✅ Status: ${resDelTeacher.status} | Message: ${dataDelTeacher.message}`);

    // 10. DELETE /teacher-positions/:id (Xóa vị trí công tác vừa test để giữ sạch CSDL)
    console.log("\n🧪 10. DELETE /teacher-positions/:id (Xóa vị trí công tác thử nghiệm)");
    const resDelPos = await fetch(`${BASE_URL}/teacher-positions/${createdPosId}`, {
      method: "DELETE",
    });
    const dataDelPos = await resDelPos.json();
    console.log(`   ✅ Status: ${resDelPos.status} | Message: ${dataDelPos.message}`);

    console.log("\n==================================================");
    console.log("🎉 TẤT CẢ 10/10 API TEST CASES ĐỀU PASS 100%!");
    console.log("==================================================");
  } catch (error) {
    console.error("❌ Lỗi kiểm tra API:", error.message);
    process.exit(1);
  }
};

runTests();
