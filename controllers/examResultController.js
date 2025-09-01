const ExamResult = require('../models/ExamResult');
const Question = require('../models/Question'); // ما به این مدل برای محاسبه نمره نیاز داریم
const mongoose = require('mongoose');
const Course = require('../models/Course');
// @desc    Submit answers and create a new exam result
// این همان تابع submitExam است که قبلاً نوشتیم، اینجا جای بهتری برای آن است
exports.submitExam = async (req, res) => {
    const { courseIds, answers } = req.body;
    const userId = req.user.id;

    console.log("--- DEBUG: SUBMIT EXAM RECEIVED ---");
    console.log("UserID:", userId, "CourseIDs:", courseIds);
    console.log("Received Answers:", answers);

    try {
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ msg: "Answers format is invalid." });
        }

        let correctCount = 0;
        let totalScore = 0;
        let achievedScore = 0;

        const questionIds = answers.map(a => a.questionId);
        const questions = await Question.find({ '_id': { $in: questionIds } });
        const questionsMap = new Map(questions.map(q => [q._id.toString(), q]));
        
        answers.forEach(userAnswer => {
            const question = questionsMap.get(userAnswer.questionId);
            if (question) {
                const questionScore = question.score || 1;
                const correctAnswer = question.correctAnswerIndex;
                const userAnswerIndex = userAnswer.answerIndex;
                
                totalScore += questionScore;
                
                if (correctAnswer != null && userAnswerIndex != null && correctAnswer.toString() === userAnswerIndex.toString()) {
                    correctCount++;
                    achievedScore += questionScore;
                }
            }
        });

        let courseNameForDisplay = 'آزمون عمومی';
        let courseToSaveInDB = null;
        if (courseIds && Array.isArray(courseIds) && courseIds.length === 1) {
            const singleCourse = await Course.findById(courseIds[0]); // <-- حالا Course شناخته شده است
            if (singleCourse) {
                courseNameForDisplay = singleCourse.name;
                courseToSaveInDB = singleCourse._id;
            }
        }
        
        const totalQuestions = answers.length;
        const wrongCount = totalQuestions - correctCount;
        const percentage = totalScore > 0 ? (achievedScore / totalScore) * 100 : 0;

        const newResult = new ExamResult({
            user: userId, 
            course: courseToSaveInDB,
            totalQuestions, 
            correctAnswers: correctCount,
            wrongAnswers: wrongCount, 
            totalScore, 
            achievedScore, 
            percentage,
        });

        await newResult.save();
        
        const responseData = newResult.toObject();
        responseData.courseName = courseNameForDisplay;

        console.log("--- DEBUG: EXAM RESULT SAVED SUCCESSFULLY ---");
        res.status(201).json(responseData);

    } catch (err) {
        console.error("!!! FATAL ERROR in submitExam:", err);
        res.status(500).json({ msg: 'Server Error during exam submission' });
    }
};
// @desc    Get the exam history for the logged-in user
// @route   GET /api/quiz-attempts/my-history
exports.getMyExamHistory = async (req, res) => {
    try {
        const results = await ExamResult.find({ user: req.user.id })
                                        .sort({ createdAt: -1 })
                                        .populate('course', 'name');

        // --- لاگ برای عیب‌یابی ---
        console.log(`Found ${results.length} exam results for user ${req.user.id}`);
        // ------------------------

        res.json(results);
    } catch (err) {
        console.error("Get History Error:", err);
        res.status(500).send('Server Error');
    }
}
