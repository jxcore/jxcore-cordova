var serveruri = "http://localhost:5002";
var serveruri2 = "http://localhost:5003";

if(typeof window === 'undefined') {

    var express = require('express')
        , request = require('superagent')
        , assert = require('assert');
    var app = express();

    app.all('/ok', function(req, res){
        res.end(req.method);
    });

    var server = app.listen(5002, function () {

        var host = server.address().address;
        var port = server.address().port;

        console.log('Example app listening at http://%s:%s', host, port);
    });

    var app2 = express();

    app2.all('/ok', function(req, res){
        res.end(req.method);
    });

    var server2 = app2.listen(5003, function () {

        var host = server2.address().address;
        var port = server2.address().port;

        console.log('Example app listening at http://%s:%s', host, port);
    });

}

if(typeof describe !== 'undefined') {
    it('request() Server1 simple GET', function (next) {
        request('GET', serveruri + '/ok').end(function (err, res) {
            console.log("result" + JSON.stringify([err,res]));
            assert(res instanceof request.Response, 'respond with Response');
            assert(res.ok, 'response should be ok');
            assert(res.text, 'res.text');
            next();
        });
    });

    it('request() Server2 simple GET', function (next) {
        request('GET', serveruri2 + '/ok').end(function (err, res) {
            console.log("result" + JSON.stringify([err,res]));
            assert(res instanceof request.Response, 'respond with Response');
            assert(res.ok, 'response should be ok');
            assert(res.text, 'res.text');
            next();
        });
    });
}
