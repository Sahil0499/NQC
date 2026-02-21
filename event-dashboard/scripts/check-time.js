import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'xlsx';
const { read, utils } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, '../public/v4.xlsx');
const fileBuffer = readFileSync(filePath);
const wb = read(fileBuffer, { type: 'buffer' });
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];

const jsonData = utils.sheet_to_json(sheet, { range: 0, defval: "" });
const person = jsonData.find(j => j['Full Name'] && j['Full Name'].includes('Chandramouli'));
console.log("Raw Time Value for Chandramouli:", person[' Arrival Time in Delhi']);
console.log("Type:", typeof person[' Arrival Time in Delhi']);
