import fs from 'fs';
import path from 'path';
import pkg from 'xlsx';
const { read, utils } = pkg;

const dirs = ['/Users/sahilsrivastava/Downloads', '/Users/sahilsrivastava/Downloads/QCI'];
const found = {};

for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (!file.endsWith('.csv') && !file.endsWith('.xlsx')) continue;
        if (file.includes('~')) continue;
        const fullPath = path.join(dir, file);
        try {
            const buf = fs.readFileSync(fullPath);
            const wb = read(buf, { type: 'buffer' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const data = utils.sheet_to_json(sheet);

            // Check for 'Live Location' column
            const active = data.filter(r => r['Live Location'] && r['Live Location'] !== 'Not arrived');
            if (active.length > 0) {
                found[file] = active.length;
                console.log(file, 'has', active.length, 'active locations');
                console.log('Sample from', file, ':', active.slice(0, 3).map(r => ({ name: r['Name'], status: r['Live Location'] })));
            }
        } catch (e) {
            // Ignore unreadable
        }
    }
}
console.log(JSON.stringify(found, null, 2));
