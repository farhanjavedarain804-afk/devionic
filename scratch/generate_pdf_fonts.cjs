const fs = require('fs');
const mBold = fs.readFileSync('src/lib/Montserrat-Bold.ttf').toString('base64');
const rReg = fs.readFileSync('src/lib/Roboto-Regular.ttf').toString('base64');
const rBold = fs.readFileSync('src/lib/Roboto-Bold.ttf').toString('base64');

const content = `export const MONTSERRAT_BOLD = "${mBold}";
export const ROBOTO_REGULAR = "${rReg}";
export const ROBOTO_BOLD = "${rBold}";`;

fs.writeFileSync('src/lib/pdf-fonts.ts', content);
console.log('Successfully created src/lib/pdf-fonts.ts');
