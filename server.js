let http = require('http');
let fs = require('fs');
let host = '127.0.0.1';
let port = 5000;
let server = http.createServer(function (req, res) {
  fs.readFile(`.${req.url == '/' ? "/index.html" : req.url}`, 'UTF-8', function (err, contents) {
    res.writeHead(200);
    res.end(contents);
  });

  // res.writeHead(404, { 'Content-Type': 'text/html' });
  // res.end('<h1>This page is not found</h1>');
});
server.listen(port, host, function () {
  console.log(`This server is runing on http://${host}:${port}`);
});
