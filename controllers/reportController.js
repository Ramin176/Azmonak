const User = require('../models/User');
const PdfPrinter = require('pdfmake');
const path = require('path');
const fs = require('fs');

// @desc    Generate and download a PDF report of users with logo and styled table
// @route   GET /api/reports/users/:status
exports.downloadUsersReport = async (req, res) => {
    try {
        const status = req.params.status === 'active'; // 'active' یا 'inactive'
        
        // ۱. گرفتن لیست کاربران از دیتابیس
        const users = await User.find({ isActive: status })
            .select('name email subscriptionType createdAt')
            .lean();

        // ۲. تعریف فونت‌ها
        const fonts = {
            Vazir: {
                normal: path.join(__dirname, '../fonts/Vazirmatn-Regular.ttf'),
                bold: path.join(__dirname, '../fonts/Vazirmatn-Bold.ttf')
            }
        };

        const printer = new PdfPrinter(fonts);

        // ۳. آماده‌سازی محتوا
       const logoPath = path.join(__dirname, '../uploads/photo_2025-09-11_14-01-25.png');


        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60], // چپ، بالا، راست، پایین
            defaultStyle: {
                font: 'Vazir',
                fontSize: 12,
                alignment: 'right'
            },
            content: [
                {
                    image: logoPath,
                    width: 120,
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                { 
                    text: `گزارش کاربران ${status ? 'فعال' : 'غیرفعال'}`, 
                    style: 'header', 
                    alignment: 'center' 
                },
                { text: '\n' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*'],
                        body: [
                            [
                                { text: 'نام', bold: true, fillColor: '#f2f2f2' },
                                { text: 'ایمیل', bold: true, fillColor: '#f2f2f2' },
                                { text: 'نوع اشتراک', bold: true, fillColor: '#f2f2f2' },
                                { text: 'تاریخ ثبت نام', bold: true, fillColor: '#f2f2f2' }
                            ],
                            ...users.map(u => [
                                u.name,
                                u.email,
                                u.subscriptionType || 'free',
                                new Date(u.createdAt).toLocaleDateString('fa-IR')
                            ])
                        ]
                    },
                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                            return rowIndex % 2 === 0 ? null : '#f9f9f9';
                        },
                        hLineWidth: function () { return 0.5; },
                        vLineWidth: function () { return 0.5; },
                        hLineColor: function () { return '#ddd'; },
                        vLineColor: function () { return '#ddd'; },
                    },
                    margin: [0, 10, 0, 0]
                }
            ],
            styles: {
                header: { fontSize: 20, bold: true }
            }
        };

        // ۴. ایجاد PDF و ارسال به کاربر
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
