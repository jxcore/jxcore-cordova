var supertest = require('supertest')
    , express = require('express');

var app = express();

app.use(express.static('public'));

var server = app.listen(3030, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});

supertest(app)
    .get('/index.html')
    .expect('Content-Type', /text\/html/)
    .expect('Content-Length', '121')
    .expect(200)
    .end(function(err, res){
        if (err) throw err;
    });

exports.app = app;

