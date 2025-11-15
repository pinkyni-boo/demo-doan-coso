import mongoose from "mongoose";

const sessionContentSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  sessionNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  objectives: {
    type: String,
    maxlength: 1000
  },
  exercises: {
    type: String,
    maxlength: 2000
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Unique index: một lớp chỉ có một nội dung cho mỗi buổi học
sessionContentSchema.index({ class: 1, sessionNumber: 1 }, { unique: true });

export default mongoose.model("SessionContent", sessionContentSchema);
