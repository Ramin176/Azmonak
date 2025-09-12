//  const User = require('../models/User');

// // const checkSubscriptionStatus = async (user) => {
// //     // اگر کاربر Premium است و تاریخ انقضای او گذشته است
// //     if (user.subscriptionType !== 'free' && user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
// //         console.log(`Subscription for ${user.email} has expired. Reverting to free.`);
// //         user.subscriptionType = 'free';
// //         user.subscriptionExpiresAt = null;
// //         // ما کاربر را در اینجا ذخیره می‌کنیم تا وضعیت او در دیتابیس آپدیت شود
// //         await user.save();
// //     }
// //     return user;
// // };

// // module.exports = { checkSubscriptionStatus };

// const checkSubscriptionStatus = async (user) => {
//     // ...
//     if (user.subscriptionType !== 'free' && user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
//         // ...
//         await user.save(); // متد save() روی خود آبجکت Mongoose کار می‌کند
//     }
//     return user; // خود آبجکت Mongoose را برمی‌گردانیم
// };

// module.exports = { checkSubscriptionStatus };


const User = require('../models/User');

const checkSubscriptionStatus = async (user) => {
    if (user.subscriptionType !== 'free' && user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
        console.log(`Subscription for ${user.email} has expired. Reverting to free.`);
        user.subscriptionType = 'free';
        user.subscriptionExpiresAt = null;
        await user.save();
    }
    return user;
};

module.exports = { checkSubscriptionStatus };
