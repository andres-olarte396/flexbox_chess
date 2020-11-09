let http = require('http');
let fs = require('fs');
let host = '127.0.0.1';
let port = 5000;
let server = http.createServer(function (req, res) {
  if (req.url === '/') {
    req.url = "app/index.html";
  } else if (req.url.startsWith('/')) {
    req.url = req.url.substring(1);
  }
  fs.readFile(req.url, 'UTF-8', function (err, contents) {
    try {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(err);
      } else {
        res.writeHead(200);
        res.end(contents);
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(req.url);
    }
  });
});
server.listen(port, host, function () {
  console.log(`This server is runing on http://${host}:${port}`);
});
