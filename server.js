let http = require('http');
let fs = require('fs');
let host = '127.0.0.1';
let port = 5000;
let server = http.createServer(function (req, res) {
  fs.readFile(`.${req.url == '/' ? "/index.html" : req.url}`, 'UTF-8', function (err, contents) {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(err);
    }
    res.writeHead(200);
    res.end(contents);
  });
});
server.listen(port, host, function () {
  console.log(`This server is runing on http://${host}:${port}`);
});
