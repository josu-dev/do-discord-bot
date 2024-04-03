import express from "express";
import { log } from '../lib/logging.js';


const PORT = process.env.PORT || 3001;

let app: express.Express;


function initWebServer() {
    app = express();

    app.get("/", (_, res) => res.type('html').send(html));

    const server = app.listen(PORT, () => {
        log.core(`Web server: listening on port ${PORT}`);
    });

    server.keepAliveTimeout = 120 * 1000;
    server.headersTimeout = 120 * 1000;
    log.core(`Web server: initialized on port ${PORT}`);
}


export { initWebServer };

const html = `
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A discord bot</title>
    <link href='https://fonts.googleapis.com/css?family=Inter' rel='stylesheet'>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <style>
        html {
            font-family: Inter;
        }

        h1 {
            text-wrap: balance;
        }
    </style>
</head>
<body class='mx-auto container px-4 bg-gray-50 h-screen grid grid-rows-[1fr,auto]'>
    <main class='flex flex-col justify-center items-center'>
        <h1 class='font-bold text-7xl'>A discord bot</h1>
        <div class='flex flex-row justify-center'>
            <p class='text-2xl mt-[1em] text-gray-800'>Check out the
                <a href='https://github.com/josu-dev/do-discord-bot'
                    class='text-gray-800 font-semibold hover:text-gray-900 hover:underline underline-offset-2'
                    id='repository-link'>
                    source code
                </a>
            </p>
        </div>
    </main>
    <footer class="p-4">
        <p class='text-lg text-center opacity-80 hover:opacity-100'>Made with <span class='text-red-500'>❤</span> by
            J-Josu
        </p>
    </footer>

    <script>
        const linkElement = document.getElementById('repository-link');

        document.getElementById('repository-link').addEventListener('mouseover', () => {
            const linkRect = linkElement.getBoundingClientRect();
            const linkCenterX = linkRect.x + (linkRect.width / 2);
            const linkCenterY = linkRect.y + (linkRect.height / 2);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { x: linkCenterX / window.innerWidth, y: linkCenterY / window.innerHeight },
                disableForReducedMotion: true
            });
        });
    </script>
</body>
</html>
`;

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
        <p>Made with ❤ by Josu</p>
    </footer>
</body>
</html>
`;
