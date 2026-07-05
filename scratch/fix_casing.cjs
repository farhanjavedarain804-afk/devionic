const fs = require('fs');
const path = 'src/components/admin/AdminBillingTabs.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use precise replacements without being sensitive to indentation or quote styles of the whole line
content = content.replace(/className=\"uppercase\">INFO@DEVIONIC.COM/g, '>info@devionic.com');
content = content.replace(/className=\"uppercase\">WWW.DEVIONIC.COM/g, '>www.devionic.com');

fs.writeFileSync(path, content);
console.log('Successfully updated casing in AdminBillingTabs.tsx');
