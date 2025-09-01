const Course = require('../models/Course');
const Category = require('../models/Category');

// === CATEGORY CONTROLLERS ===

// @desc    Create a new category
// @route   POST /api/courses/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategory = new Category({ name, description });
    const category = await newCategory.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all categories
// @route   GET /api/courses/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// === COURSE CONTROLLERS ===

// @desc    Create a new course
// @route   POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;
    const newCourse = new Course({
      name,
      description,
      category: categoryId,
    });
    const course = await newCourse.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get all courses for a specific category
// @route   GET /api/courses/category/:categoryId
exports.getCoursesByCategory = async (req, res) => {
  try {
    const courses = await Course.find({ category: req.params.categoryId });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('category', 'name'); // با این کار، نام دسته‌بندی را هم نشان می‌دهیم
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};