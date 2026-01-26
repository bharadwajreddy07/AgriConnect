const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\AgriMart\\frontend\\public\\images\\crops';

// Map target (broken/wrong) -> source (existing/good)
const replacements = [
    { target: 'greengram.jpg', source: 'lentils.png' }, // Lentils look closer to green gram than paddy
    { target: 'blackgram.jpg', source: 'lentils.png' },
    { target: 'watermelon.png', source: 'pumpkin.png' }, // Round
    { target: 'okra.png', source: 'cucumber.png' },      // Green/Long
    { target: 'turmeric.png', source: 'ginger.png' },    // Rhizome
    { target: 'barley.jpg', source: 'wheat.png' },       // Cereal
    { target: 'chickpeas.jpg', source: 'chickpeas.png' } // Ensure jpg exists if ref'd
];

replacements.forEach(rep => {
    const srcPath = path.join(srcDir, rep.source);
    const destPath = path.join(srcDir, rep.target);

    try {
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`✅ Replaced ${rep.target} with ${rep.source}`);
        } else {
            console.error(`❌ Source not found: ${rep.source}`);
        }
    } catch (err) {
        console.error(`❌ Fail ${rep.target}: ${err.message}`);
    }
});
