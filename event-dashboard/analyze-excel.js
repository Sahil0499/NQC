import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'xlsx';
const { readFile, utils } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const file = readFile(join(__dirname, 'public/data.xlsx'));

console.log('Sheets:', file.SheetNames);

file.SheetNames.forEach(name => {
    const sheet = file.Sheets[name];
    const json = utils.sheet_to_json(sheet, { header: 1 });
    console.log(`\nSheet: ${name}`);
    // Use try-catch or safe access since row might not exist
    if (json[0]) console.log('Headers:', json[0]);
    if (json[1]) console.log('Row 1:', json[1]);
});
