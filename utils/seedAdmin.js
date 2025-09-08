const User = require('../models/User');

const seedAdminUser = async () => {
    try {
        const adminEmail = 'saberyinstitute@gmail.com';

        // چک کن آیا ادمین از قبل وجود دارد
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            // اگر وجود نداشت، آن را بساز
            const adminUser = new User({
                name: 'Sabery Institute Admin',
                email: adminEmail,
                password: 'sabery121@', // پسورد قبل از ذخیره، هش می‌شود
                // می‌توانید این کاربر را به صورت پیش‌فرض Premium هم بکنید
                subscriptionType: 'yearly',
                subscriptionExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 10)) // ۱۰ سال اعتبار
            });

            await adminUser.save();
            console.log('Static admin user created/verified successfully.');
        } else {
            console.log('Static admin user already exists.');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

module.exports = seedAdminUser;