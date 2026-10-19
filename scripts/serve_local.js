const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8092;
const HOST = "127.0.0.1";
const WEB_DIR = path.join(__dirname, "..", "web");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/" || reqPath === "") {
    reqPath = "/index.html";
  }

  const filePath = path.normalize(path.join(WEB_DIR, reqPath));

  // Security: prevent path traversal outside WEB_DIR
  if (!filePath.startsWith(WEB_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache"
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[Arc Instant Splitter] Local Dev Server running at http://${HOST}:${PORT}`);
});
