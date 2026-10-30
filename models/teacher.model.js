import mongoose from "mongoose";

const degreeSchema = new mongoose.Schema(
  {
    type: {
      type: String, // Loại bằng cấp: Cử nhân, Thạc sĩ, Tiến sĩ...
      trim: true,
    },
    school: {
      type: String,
      trim: true,
    },
    major: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
    },
    isGraduated: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    teacherPositionsId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TeacherPosition",
      },
    ],
    degrees: [degreeSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const TeacherModel = mongoose.model("Teacher", teacherSchema);
export default TeacherModel;
