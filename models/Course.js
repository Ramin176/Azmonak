const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, // به یک دسته‌بندی متصل است
    ref: 'Category',
    required: true,
  },
  // برای پشتیبانی از چند زبان
  name_en: { type: String },
  name_ps: { type: String },
});

module.exports = mongoose.model('Course', CourseSchema);