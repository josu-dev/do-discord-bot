const express = require("express");
import fs from "fs";
import { logWithTime } from '../lib';


const DEFAULT_HTML = `<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A discord bot</title>
</head>
<body>
    <main>
        <h1>A discord bot</h1>
    </main>
    <footer>
        <p>Made with ❤ by J-Josu</p>
    </footer>
</body>
</html>
`;

let html: string;

try {
    html = fs.readFileSync(__dirname + '/index.html', 'utf8');
} catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
        logWithTime(`Web server: index.html not found, using default html`);
        html = DEFAULT_HTML;
    } else {
        throw e;
    }
}

const PORT = process.env.PORT || 3001;

let app: typeof express;


function initWebServer() {
    app = express();

    // @ts-expect-error
    app.get("/", (req, res) => res.type('html').send(html));

    const server = app.listen(PORT, () => {
        logWithTime(`Web server: listening on port ${PORT}`);
    });

    server.keepAliveTimeout = 120 * 1000;
    server.headersTimeout = 120 * 1000;
    logWithTime(`Web server: initialized on port ${PORT}`);
}


export { initWebServer };
