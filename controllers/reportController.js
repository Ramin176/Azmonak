const User = require('../models/User');
const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs'); 
exports.downloadUsersReport = async (req, res) => {
    try {
        const status = req.params.status === 'active';
        const users = await User.find({ isActive: status })
            .select('name email subscriptionType createdAt')
            .lean();

        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        const filename = `users-report-${req.params.status}-${new Date().toISOString().slice(0,10)}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

         const fontPath = path.join(__dirname, '..', 'fonts', 'Vazirmatn-Regular.ttf');
        doc.registerFont('Vazir', fontPath);
        // const fontPath = path.resolve('./fonts/Vazirmatn-Regular.ttf');
        // doc.registerFont('Vazir', fontPath);
        
        // const logoPath = path.resolve('./public/uploads/photo_2025-09-11_14-01-25.jpg'); 
        // if (fs.existsSync(logoPath)) {
        //     doc.image(logoPath, 30, 30, { width: 70 });
        // }

        const logoPath = path.join(__dirname, '..', 'uploads', 'photo_2025-09-11_14-01-25.jpg');
        doc.image(logoPath, 30, 30, { width: 70 });
        doc.font('Vazir').fontSize(20).text(`گزارش کاربران ${status ? 'فعال' : 'غیرفعال'}`, { align: 'center' });
        doc.fontSize(10).text(new Date().toLocaleDateString('fa-IR'), { align: 'center' });
        doc.moveDown(3);

        doc.font('Vazir').fontSize(20).text(`گزارش کاربران ${status ? 'فعال' : 'غیرفعال'}`, { align: 'center' });
        doc.fontSize(10).text(new Date().toLocaleDateString('fa-IR'), { align: 'center' });
        doc.moveDown(3);


        // --- تغییر اصلی: تبدیل آبجکت‌ها به آرایه‌ای از آرایه‌ها ---
        const tableRows = users.map(user => [
            new Date(user.createdAt).toLocaleDateString('fa-IR'),
            user.subscriptionType || 'free',
            user.email,
            user.name
        ]);
        // ----------------------------------------------------

        const table = {
            headers: ["تاریخ ثبت نام", "نوع اشتراک", "ایمیل", "نام"],
            rows: tableRows, // <-- حالا از آرایه تبدیل شده استفاده می‌کنیم
        };

        // فراخوانی بدون await
        doc.table(table, {
            rtl: true,
            prepareHeader: () => doc.font('Vazir').fontSize(11).fillColor('white'),
            prepareRow: (row, indexColumn, indexRow, rectRow) => {
                doc.font('Vazir').fontSize(9).fillColor('black');
                // رنگی کردن یکی در میان ردیف‌ها
                if (indexRow % 2 === 0) doc.addBackground(rectRow, '#f5f5f5', 0.9);
            },
            // استایل بهتر برای هدر
            headerColor: '#008080', // رنگ Teal
            headerOpacity: 1,
        });

        doc.end();

    } catch (err) {
        console.error("Report Generation Error:", err);
        if (!res.headersSent) {
            res.status(500).send("Could not generate report.");
        }
    }
};