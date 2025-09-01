// فایل: models/ExamResult.js
const mongoose = require('mongoose');

const ExamResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
       
    },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    wrongAnswers: { type: Number, required: true },
    totalScore: { type: Number, required: true },
    achievedScore: { type: Number, required: true },
    percentage: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ExamResult', ExamResultSchema);