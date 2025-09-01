const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  // برای پشتیبانی از چند زبان
  name_en: { type: String },
  name_ps: { type: String },
});

module.exports = mongoose.model('Category', CategorySchema);