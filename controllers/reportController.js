const User = require('../models/User');
const PdfPrinter = require('pdfmake');
const path = require('path');
const fs = require('fs');
const moment = require('moment-jalaali'); // برای تاریخ شمسی

exports.downloadUsersReport = async (req, res) => {
    try {
        const status = req.params.status === 'active';

        // گرفتن کاربران
        const users = await User.find({ isActive: status })
            .select('name email subscriptionType createdAt')
            .lean();

        // فونت‌ها
        const fonts = {
            Vazir: {
                normal: path.join(__dirname, '../fonts/Vazirmatn-Regular.ttf'),
                bold: fs.existsSync(path.join(__dirname, '../fonts/Vazirmatn-Regular.ttf'))
                    ? path.join(__dirname, '../fonts/Vazirmatn-Regular.ttf')
                    : path.join(__dirname, '../fonts/Vazirmatn-Regular.ttf')
            }
        };

        const printer = new PdfPrinter(fonts);

        // لوگو
        const logoPath = path.join(__dirname, '../uploads/photo_2025-09-11_14-01-25.png');
        const contentArray = [];

        if (fs.existsSync(logoPath)) {
            contentArray.push({
                image: logoPath,
                width: 120,
                alignment: 'center',
                margin: [0, 0, 0, 20]
            });
        }

        // عنوان
        contentArray.push({
            text: status ? ' فعال کاربران گزارش' : 'غیرفعال کاربران گزارش',
            style: 'header',
            alignment: 'center',
              direction: 'rtl'
        });
        contentArray.push({ text: '\n' });

        // جدول کاربران
        const tableBody = [];

        // ردیف هدر
        tableBody.push([
            { text: 'نام', bold: true, fillColor: '#f2f2f2' },
            { text: 'ایمیل', bold: true, fillColor: '#f2f2f2' },
            { text: 'نوع اشتراک', bold: true, fillColor: '#f2f2f2' },
            { text: 'تاریخ ثبت نام', bold: true, fillColor: '#f2f2f2' }
        ]);

        // ردیف‌های داده
        users.forEach(user => {
            tableBody.push([
                { text: user.name, noWrap: false },
                { text: user.email, noWrap: false },
                { text: user.subscriptionType || 'free', noWrap: false },
                { text: moment(user.createdAt).format('jYYYY/jMM/jDD'), noWrap: false }
            ]);
        });

        contentArray.push({
            table: {
                headerRows: 1,
                widths: [80, '*', 80, 100],
                body: tableBody
            },
            layout: {
                fillColor: (rowIndex) => rowIndex % 2 === 0 ? null : '#f9f9f9',
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#ddd',
                vLineColor: () => '#ddd'
            },
            margin: [0, 10, 0, 0]
        });

        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],
            defaultStyle: { font: 'Vazir', fontSize: 12, alignment: 'right' },
            content: contentArray,
            styles: { header: { fontSize: 20, bold: true } }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        const filename = `users-report-${req.params.status}-${new Date().toISOString().slice(0,10)}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/pdf');

        pdfDoc.pipe(res);
        pdfDoc.end();

    } catch (err) {
        console.error("Report Generation Error:", err);
        res.status(500).send("Could not generate report.");
    }
};
