const User = require('../models/User');
const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');

// تابع کمکی برای برعکس کردن متن فارسی (برای نمایش صحیح در pdfkit)
function reverseText(text) {
    if (!text) return '';
    return text.split('').reverse().join('');
}

exports.downloadUsersReport = async (req, res) => {
    try {
        const status = req.params.status === 'active';
        const users = await User.find({ isActive: status }).select('name email subscriptionType createdAt').lean();

        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        
        const filename = `users-report-${req.params.status}-${new Date().toISOString().slice(0,10)}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        const fontPath = path.resolve('./fonts/Vazirmatn-Regular.ttf');
        if (!fs.existsSync(fontPath)) throw new Error('Font file not found');
        doc.registerFont('Vazir', fontPath);
        
        const logoPath = path.resolve('./public/logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, { fit: [80, 80], align: 'left', valign: 'top' });
        }
        
        doc.font('Vazir').fontSize(20).text(reverseText(`گزارش کاربران ${status ? 'فعال' : 'غیرفعال'}`), { align: 'center' });
        doc.fontSize(10).text(new Date().toLocaleDateString('fa-IR-u-nu-latn'), { align: 'center' });
        doc.moveDown(2);

        const tableData = users.map(user => ({
            name: reverseText(user.name),
            email: user.email,
            subscriptionType: user.subscriptionType || 'free',
            createdAt: new Date(user.createdAt).toLocaleDateString('fa-IR-u-nu-latn')
        }));
        
        const table = {
            headers: [
                { label: reverseText("نام"), property: 'name', width: 120, renderer: (value) => value },
                { label: reverseText("ایمیل"), property: 'email', width: 150 },
                { label: reverseText("نوع اشتراک"), property: 'subscriptionType', width: 80 },
                { label: reverseText("تاریخ ثبت نام"), property: 'createdAt', width: '*' },
            ],
            datas: tableData,
        };
        
        // --- فراخوانی صحیح doc.table با استفاده از Promise ---
        const generateTable = async () => {
            await doc.table(table, {
                prepareHeader: () => doc.font('Vazir').fontSize(11),
                prepareRow: (row, indexColumn, indexRow, rectRow) => {
                    doc.font('Vazir').fontSize(9);
                },
            });
        };

        generateTable().then(() => {
            doc.end();
            console.log("PDF generated and stream ended successfully.");
        }).catch(err => {
            console.error("Error during table generation:", err);
            if (!res.headersSent) {
               res.status(500).send("Could not generate table in PDF.");
            }
        });
        
    } catch (err) {
        console.error("Report Generation Error:", err);
        if (!res.headersSent) {
            res.status(500).send("Could not generate report.");
        }
    }
};