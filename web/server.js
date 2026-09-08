const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'out', req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end();
        return;
    }
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.pf_index' || ext === '.pf_meta' || ext === '.pf_fragment') contentType = 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
}).listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
