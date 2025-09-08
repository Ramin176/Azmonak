const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdminUser = async () => {
    try {
        const adminEmail = 'saberyinstitute@gmail.com';
        const adminPassword = 'sabery121@';

        let adminUser = await User.findOne({ email: adminEmail });

        if (!adminUser) {
            adminUser = new User({
                name: 'Sabery Institute Admin',
                role: 'admin',
                email: adminEmail,
                password: adminPassword,
                subscriptionType: 'yearly',
                subscriptionExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
            });
            await adminUser.save();
            console.log('Static admin user CREATED successfully.');
        } else {
            const isMatch = await bcrypt.compare(adminPassword, adminUser.password);
            if (!isMatch) {
                adminUser.password = adminPassword;
                await adminUser.save();
                console.log('Static admin user password UPDATED successfully.');
            } else {
                console.log('Static admin user already exists with correct password.');
            }
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

module.exports = seedAdminUser;