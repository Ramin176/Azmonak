const User = require('../models/User');
const PDFDocument = require('pdfkit'); // اصلی PDFKit
require('pdfkit-table'); // اضافه کردن متد table
const path = require('path');

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

        // فونت فارسی
        const fontPath = path.join(__dirname, '..', 'fonts', 'Vazirmatn-Regular.ttf');
        doc.registerFont('Vazir', fontPath);

        // لوگو و عنوان
        const logoPath = path.join(__dirname, '..', 'uploads', 'photo_2025-09-11_14-01-25.jpg');
        doc.image(logoPath, 30, 30, { width: 70 });
        doc.font('Vazir').fontSize(20).text(`گزارش کاربران ${status ? 'فعال' : 'غیرفعال'}`, { align: 'center' });
        doc.fontSize(10).text(new Date().toLocaleDateString('fa-IR'), { align: 'center' });
        doc.moveDown(3);

        // جدول
        const table = {
            headers: [
                { label: "تاریخ ثبت نام", property: 'createdAt', width: 100, renderer: (value) => new Date(value).toLocaleDateString('fa-IR') },
                { label: "نوع اشتراک", property: 'subscriptionType', width: 100, renderer: (value) => value || 'free' },
                { label: "ایمیل", property: 'email', width: 150 },
                { label: "نام", property: 'name', width: '*' },
            ],
            rows: users,
        };

        doc.table(table, {
            rtl: true,
            prepareHeader: () => doc.font('Vazir').fontSize(12),
            prepareRow: (row, indexColumn, indexRow, rectRow) => {
                doc.font('Vazir').fontSize(10);
                if (indexRow % 2 === 0) doc.addBackground(rectRow, 'gray', 0.1);
            },
        });

        doc.end();

    } catch (err) {
        console.error("Report Generation Error:", err);
        if (!res.headersSent) {
            res.status(500).send("Could not generate report.");
        }
    }
};
