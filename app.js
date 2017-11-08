const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

var server = http.createServer(function (req, res) {
    if(req.url == '/favicon.ico') return;
    if (req.url != '/movie.mp4') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`<video src="http://localhost:3000/movie.mp4" controls></video>`);
    } else {
        var file = path.resolve(__dirname, 'movie.mp4');
        fs.stat(file, function (error, stats) {
            if (error) {
                if (error.code == 'ENOENT') {
                    return res.sendStatus(404);
                }
                res.end(error);
            }

            var range = req.headers.range;

            if (!range) {
                return res.sendStatus(416);
            }
            var position = range.replace('/bytes=/', '').split('-');

            var start = position[0];
            var total = stats.size;
            var end = position[1] ? parseInt(position[1]) : total - 1;
            var chunkSize = (end - start) - 1;

            res.writeHead({
                'Content-Range': `bytes ${start}-${end}/${total}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4'
            });

            var stream = fs.createReadStream(file, {start, end}).on('open', function () {
                stream.pipe(res);
            }).on('error', function (error) {
                res.end(error);
            })

        });
    }
});

server.listen(3000, function () {
    console.log("Server is running on port 3000...");
})