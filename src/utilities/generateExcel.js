import XLSX from 'xlsx';

const pickExcelFields = (data, keys) => {
  return Object.keys(data)
    .filter((i) => keys.includes(i))
    .reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});
};

export const generateExcel = (gridApi, fileName) => {
  let excelColumns = gridApi.columnController
    .getAllDisplayedColumns()
    .map((column) => column.colDef.field);
  let currentRowData = gridApi.rowModel.rowsToDisplay.map((row) => row.data);

  let excelData = currentRowData.map((row) =>
    pickExcelFields(row, excelColumns)
  );

  var worksheet = XLSX.utils.json_to_sheet(excelData, {
    header: excelColumns.filter(
      (col) => Object.keys(excelData[0]).indexOf(col) > -1
    ),
  });
  var new_workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(new_workbook, worksheet, 'Sheet1');

  XLSX.writeFile(new_workbook, fileName, { type: 'file' });
};
