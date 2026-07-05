const https = require('https');
const fs = require('fs');

const fonts = {
  'Montserrat-Bold.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf',
  'Roboto-Regular.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/static/Roboto-Regular.ttf',
  'Roboto-Bold.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/static/Roboto-Bold.ttf'
};

Object.entries(fonts).forEach(([name, url]) => {
  https.get(url, (res) => {
    const stream = fs.createWriteStream(`src/lib/${name}`);
    res.pipe(stream);
    stream.on('finish', () => console.log(`Downloaded ${name}`));
  }).on('error', (err) => console.error(`Error downloading ${name}:`, err));
});
