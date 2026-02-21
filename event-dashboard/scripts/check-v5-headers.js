import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'xlsx';
const { read, utils } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, '../public/finaldatav5.xlsx');
const fileBuffer = readFileSync(filePath);
const wb = read(fileBuffer, { type: 'buffer' });
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];

const rawData = utils.sheet_to_json(sheet, { range: 0, defval: "" });
if (rawData.length > 0) {
    console.log("EXACT HEADERS IN v5:");
    console.log(Object.keys(rawData[0]).map(k => `'${k}'`));
}
