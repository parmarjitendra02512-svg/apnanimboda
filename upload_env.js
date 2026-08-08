const fs = require('fs');
const { spawnSync } = require('child_process');

function run() {
    const envLocal = fs.readFileSync('.env.local', 'utf8');
    const lines = envLocal.split('\n');
    let i = 0;
    
    while (i < lines.length) {
        let line = lines[i].trim();
        if (line === '' || line.startsWith('#')) {
            i++;
            continue;
        }
        
        let index = line.indexOf('=');
        if (index === -1) {
            i++;
            continue;
        }
        
        const key = line.substring(0, index).trim();
        let valueStr = line.substring(index + 1).trim();
        
        if (key === 'VERCEL_OIDC_TOKEN') {
            i++;
            continue;
        }
        
        let value = valueStr;
        // Basic unquoting if the whole line is a single quoted string
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'")) {
            // It might be a multiline string! Like FIREBASE_SERVICE_ACCOUNT
            let fullValue = value;
            while (i + 1 < lines.length && !fullValue.endsWith("'")) {
                i++;
                fullValue += '\n' + lines[i];
            }
            if (fullValue.endsWith("'")) {
                fullValue = fullValue.substring(1, fullValue.length - 1);
            }
            value = fullValue;
        }
        
        // Handle unescaping \n for the private key specifically
        if (key === 'FIREBASE_SERVICE_ACCOUNT') {
            // The JSON might have literal \n that should be preserved, wait no, 
            // the JSON was single quoted. Let's just use JSON.parse if it's JSON.
            // Actually, we don't need to unescape \\n because when we send it to Vercel, it should be whatever is between the quotes.
        }

        console.log(`Adding ${key} to production...`);
        // We add it to production, preview, and development
        const envs = ['production', 'preview', 'development'];
        for (const env of envs) {
            console.log(` -> ${env}`);
            const child = spawnSync('cmd.exe', ['/c', `vercel env add ${key} ${env}`], { input: value, encoding: 'utf-8' });
            if (child.error) {
                console.error(`Error:`, child.error);
            }
        }
        
        i++;
    }
    
    console.log("Deploying to production...");
    const deploy = spawnSync('cmd.exe', ['/c', 'vercel --prod'], { stdio: 'inherit' });
}

run();
