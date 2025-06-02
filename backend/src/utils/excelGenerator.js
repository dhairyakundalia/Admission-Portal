// backend/utils/excelGenerator.js
import excelJS from 'exceljs';

async function generateExcel(columns, data, sheetName = 'Sheet1', creator = "Admin") {
    const workbook = new excelJS.Workbook();
    workbook.creator = creator;
    workbook.lastModifiedBy = creator;
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = columns;
    worksheet.addRows(data);
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true};
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    return workbook;
}

export { generateExcel };