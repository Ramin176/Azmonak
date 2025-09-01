const Question = require('../models/Question');
const xlsx = require('xlsx');
const fs = require('fs');
const mongoose = require('mongoose');
// افزودن یک سوال تکی (حالا ساده‌تر است)
exports.addQuestion = async (req, res) => {
    try {
        const newQuestion = new Question(req.body);
        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};


exports.getRandomQuestions = async (req, res) => {
    try {
        const { courseIds, limit } = req.body;

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ msg: 'Course IDs must be a non-empty array.' });
        }
        
        const parsedLimit = parseInt(limit, 10);
        if (isNaN(parsedLimit) || parsedLimit <= 0) {
            return res.status(400).json({ msg: 'Limit must be a positive number.' });
        }

        // --- این بخش بسیار مهم است ---
        // تبدیل رشته‌های ID به آبجکت‌های ObjectId معتبر
        const validObjectIds = courseIds
            .filter(id => mongoose.Types.ObjectId.isValid(id))
            .map(id => new mongoose.Types.ObjectId(id));

        if (validObjectIds.length === 0) {
            // این خطا ممکن است رخ دهد اگر ID های ارسالی از فلاتر معتبر نباشند
            return res.status(400).json({ msg: 'No valid course IDs provided.' });
        }
        // ---------------------------------

        const questions = await Question.aggregate([
            { $match: { course: { $in: validObjectIds } } },
            { $sample: { size: parsedLimit } }
        ]);
        
        // اگر هیچ سوالی پیدا نشد، یک آرایه خالی برگردان (این خطا نیست)
        res.json(questions);

    } catch (err) {
        console.error("!!! ERROR in getRandomQuestions:", err);
        res.status(500).json({ msg: 'Server Error' }); // یک پیام JSON برگردان
    }
};
// بارگذاری گروهی هوشمند
exports.uploadQuestions = async (req, res) => {
    const { courseId } = req.params;
    if (!req.file) return res.status(400).send('No file uploaded.');

    try {
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const results = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        fs.unlinkSync(req.file.path);

        const questionsToSave = results.map(row => {
            const questionData = { course: courseId };
            
            // Map columns from Excel to our model fields
            questionData.type = row.type;
            questionData.text = row.text;
            questionData.score = row.score || 1;
            questionData.explanation = row.explanation;

            if (row.type === 'multiple_choice') {
                questionData.options = [];
                for(let i = 1; i <= 4; i++) {
                    if (row[`option${i}`]) {
                        questionData.options.push({ text: row[`option${i}`] });
                    }
                }
                questionData.correctAnswerIndex = parseInt(row.correctAnswerIndex) - 1;
            }
            
            if (row.type === 'true_false') {
                questionData.correctAnswerBool = String(row.correctAnswerBool).toLowerCase() === 'true';
            }

            // ... add other types here ...
            return questionData;
        }).filter(q => {
    if (!q.type || !q.text) {
        console.log("ردیف نامعتبر نادیده گرفته شد:", q); // <-- لاگ جدید برای عیب‌یابی
        return false;
    }
    return true}); // Filter out invalid rows

        if (questionsToSave.length === 0) {
             return res.status(400).json({ msg: 'No valid questions found in the file.' });
        }

        const newQuestions = await Question.insertMany(questionsToSave);
        res.status(201).json({ msg: `${newQuestions.length} questions uploaded.`, questions: newQuestions });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: err.message });
    }
}
// @desc    Update a question
exports.updateQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question) return res.status(404).json({ msg: 'Question not found' });
        res.json(question);
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

// @desc    Delete a single question
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) return res.status(404).json({ msg: 'Question not found' });
        res.json({ msg: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// @desc    Delete multiple questions
exports.deleteMultipleQuestions = async (req, res) => {
    try {
        // req.body.ids should be an array of question IDs
        const { ids } = req.body;
        await Question.deleteMany({ _id: { $in: ids } });
        res.json({ msg: `${ids.length} questions deleted successfully.` });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
exports.getAllQuestionsForCourse = async (req, res) => {
    try {
        const questions = await Question.find({ course: req.params.courseId });
        res.json(questions);
    } catch (err) {
        console.error("Get All Questions Error:", err);
        res.status(500).send('Server Error');
    }
}