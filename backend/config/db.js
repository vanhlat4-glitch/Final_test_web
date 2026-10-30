import mongoose from "mongoose";

const DEFAULT_URI =
  "mongodb+srv://vleg8428_db_user:Vietanh123@cluster0.7evhhcd.mongodb.net/final_test?appName=Cluster0";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.URI_MONGO || DEFAULT_URI);
    console.log(`✅ Kết nối MongoDB thành công: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};
