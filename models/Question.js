const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    text: { type: String, required: true }
}, { _id: false });

const MatchPairSchema = new mongoose.Schema({
    prompt: { type: String, required: true },
    answer: { type: String, required: true }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    type: {
        type: String,
        enum: ['multiple_choice', 'true_false', 'fill_in_the_blank', 'matching'],
        required: true,
    },
    text: { type: String, required: true },
    score: { type: Number, default: 1 },
    explanation: { type: String },
    imageUrl: { type: String },
    // فیلدهای مخصوص چهارگزینه‌ای
    options: [OptionSchema],
    correctAnswerIndex: { type: Number },

    // فیلد مخصوص صحیح/غلط
    correctAnswerBool: { type: Boolean },
    
    // فیلد مخصوص جای خالی
    correctAnswerText: { type: String },
    
    // فیلدهای مخصوص مچینگ
    matchingPrompts: [String], // ستون اول
    matchingAnswers: [String], // ستون دوم (گزینه‌ها)
    correctMatches: [MatchPairSchema], // جفت‌های صحیح
});

module.exports = mongoose.model('Question', QuestionSchema);