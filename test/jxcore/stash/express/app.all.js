if(typeof window === 'undefined') {
  var express = require('express')
      , request = require('superagent')
      , assert = require('assert');
  var app = express();

    var n = 0;
    app.all('/*', function(req, res, next){
        if (n++ > 1) {
            res.status(404) // HTTP status 404: NotFound
                .send('Not found');
        }
        next();
    });

  app.all('/tobi', function(req, res){
    res.end(req.method);
  });

  var server = app.listen(5001, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
}

if(typeof describe !== 'undefined') {
  var appalluri = "http://localhost:5001";
  describe('app.all()', function () {
    it('should add a router per method', function (done) {
      request('PUT',appalluri + '/tobi')
          .end(function (err, res) {
              assert(res.ok, 'response should be ok');
              request('GET',appalluri + "/tobi")
                  .end(function (err, res) {
                      assert(res.ok, 'response should be ok');
                      done();
                  });
          });
    });

    //  05-21 11:34:55.541  24726-24726/com.openmoney.p2p I/Web Console﹕ delete response[null,{"req":{"_query":[],"method":"DELETE","url":"http://localhost:5001/tobi","header":{},"_header":{},"_callbacks":{"end":[null]},"xhr":{"onerror":null,"onabort":null,"statusText":"OK","withCredentials":false,"response":"DELETE","onloadstart":null,"responseXML":null,"readyState":4,"responseText":"DELETE","responseType":"","onprogress":null,"onload":null,"upload":{"onabort":null,"onerror":null,"onload":null,"onloadstart":null,"onprogress":null},"status":200},"_timeout":0},"xhr":{"onerror":null,"onabort":null,"statusText":"OK","withCredentials":false,"response":"DELETE","onloadstart":null,"responseXML":null,"readyState":4,"responseText":"DELETE","responseType":"","onprogress":null,"onload":null,"upload":{"onabort":null,"onerror":null,"onload":null,"onloadstart":null,"onprogress":null},"status":200},"text":"DELETE","statusText":"OK","status":200,"statusType":2,"info":false,"ok":true,"clientError":false,"serverError":false,"error":false,"accepted":false,"noContent":false,"badRequest":false,"unauthorized":false,"notAcceptable":false,"notFound":false,"forbidden":false,"headers":{"date":"Thu, 21 May 2015 18:34:55 GMT","x-powered-by":"Express","transfer-encoding":"chunked","connection":"keep-alive","content-type":null},"header":{"date":"Thu, 21 May 2015 18:34:55 GMT","x-powered-by":"Express","transfer-encoding":"chunked","connection":"keep-alive","content-type":null},"type":"","body":null}] at file:///android_asset/www/jxcore/test/express/app.all.js:43

    it('should run the callback for a method just once', function (done) {
      request('DELETE',appalluri + '/tobi').end(function(err,res){
          console.log("delete response" + JSON.stringify([err,res]));
          assert(res.status == 404, "response should be 404 Not Found");
          done();
      });
    });
  });
}