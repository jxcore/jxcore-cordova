if (typeof window === "undefined") {

  var assert = require('assert');
  var request = require('superagent');

} else {

    //Only run in the browser.
    if (typeof it !== 'undefined') {

        var uri = "http:///localhost:5000";

        it('Request inheritance', function () {
            assert(request.get(uri + '/') instanceof request.Request);
        });

        it('request() simple GET without callback', function (next) {
            request('GET', uri + '/test/test.request.js').end();
            next();
        });

        it('request() simple GET', function (next) {
            request('GET', uri + '/ok').end(function (err, res) {
                console.log("result" + JSON.stringify([err, res]));
                assert(res instanceof request.Response, 'respond with Response');
                assert(res.ok, 'response should be ok');
                assert(res.text, 'res.text');
                next();
            });
        });

        it('request() simple HEAD', function (next) {
            request.head(uri + '/ok').end(function (err, res) {
                assert(res instanceof request.Response, 'respond with Response');
                assert(res.ok, 'response should be ok');
                assert(!res.text, 'res.text');
                next();
            });
        });

        /*
         Cordova android is missing the res.error.message in the response.
         */
        it('request() error object', function (next) {
            request('GET', uri + '/error').end(function (err, res) {
                //console.log("error result:" + JSON.stringify([err,res]));
                assert(err);
                assert(res.error, 'response should be an error');
                //assert(res.error.message == 'cannot GET /error (500)');
                assert(res.error.status == 500);
                assert(res.error.method == 'GET');
                assert(res.error.url == uri + '/error');
                next();
            });
        });

        it('request() GET 5xx', function (next) {
            request('GET', uri + '/error').end(function (err, res) {
                assert(err);
                assert(err.message == 'Internal Server Error');
                assert(!res.ok, 'response should not be ok');
                assert(res.error, 'response should be an error');
                assert(!res.clientError, 'response should not be a client error');
                assert(res.serverError, 'response should be a server error');
                next();
            });
        });

        it('request() GET 4xx', function (next) {
            request('GET', uri + '/notfound').end(function (err, res) {
                assert(err);
                assert.equal(err.message, 'Not Found');
                assert(!res.ok, 'response should not be ok');
                assert(res.error, 'response should be an error');
                assert(res.clientError, 'response should be a client error');
                assert(!res.serverError, 'response should not be a server error');
                next();
            });
        });

        it('request() GET 404 Not Found', function (next) {
            request('GET', uri + '/notfound').end(function (err, res) {
                assert(err);
                assert(res.notFound, 'response should be .notFound');
                next();
            });
        });

        it('request() GET 400 Bad Request', function (next) {
            request('GET', uri + '/bad-request').end(function (err, res) {
                assert(err);
                assert(res.badRequest, 'response should be .badRequest');
                next();
            });
        });

        it('request() GET 401 Bad Request', function (next) {
            request('GET', uri + '/unauthorized').end(function (err, res) {
                assert(err);
                assert(res.unauthorized, 'response should be .unauthorized');
                next();
            });
        });

        it('request() GET 406 Not Acceptable', function (next) {
            request('GET', uri + '/not-acceptable').end(function (err, res) {
                assert(err);
                assert(res.notAcceptable, 'response should be .notAcceptable');
                next();
            });
        });

        it('request() GET 204 No Content', function (next) {
            request('GET', uri + '/no-content').end(function (err, res) {
                assert.ifError(err);
                assert(res.noContent, 'response should be .noContent');
                next();
            });
        });

        it('request() DELETE 204 No Content', function (next) {
            request('DELETE', uri + '/no-content').end(function (err, res) {
                assert.ifError(err);
                assert(res.noContent, 'response should be .noContent');
                next();
            });
        });

        it('request() header parsing', function (next) {
            request('GET', uri + '/notfound').end(function (err, res) {
                assert(err);
                assert('text/html; charset=utf-8' == res.header['content-type']);
                assert('Express' == res.header['x-powered-by']);
                next();
            });
        });

        it('request() .status', function (next) {
            request('GET', uri + '/notfound').end(function (err, res) {
                assert(err);
                assert(404 == res.status, 'response .status');
                assert(4 == res.statusType, 'response .statusType');
                next();
            });
        });

        it('get()', function (next) {
            request.get(uri + '/notfound').end(function (err, res) {
                assert(err);
                assert(404 == res.status, 'response .status');
                assert(4 == res.statusType, 'response .statusType');
                next();
            });
        });

// This test results in a weird Jetty error on IE9 and IE11 saying PATCH is not a supported method. Looks like something's up with SauceLabs
        var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
        var isIE9OrOlder = !window.atob;
        if (!isIE9OrOlder && !isIE11) { // Don't run on IE9 or older, or IE11
            it('patch()', function (next) {
                request.patch(uri + '/user/12').end(function (err, res) {
                    assert('updated' == res.text);
                    next();
                });
            });
        }

        it('put()', function (next) {
            request.put(uri + '/user/12').end(function (err, res) {
                assert('updated' == res.text, 'response text');
                next();
            });
        });

        it('post()', function (next) {
            request.post(uri + '/user').end(function (err, res) {
                assert('created' == res.text, 'response text');
                next();
            });
        });

        it('del()', function (next) {
            request.del(uri + '/user/12').end(function (err, res) {
                assert('deleted' == res.text, 'response text');
                next();
            });
        });

        it('post() data', function (next) {
            request.post(uri + '/todo/item')
                .type('application/octet-stream')
                .send('tobi')
                .end(function (err, res) {
                    assert('added "tobi"' == res.text, 'response text');
                    next();
                });
        });

        it('request .type()', function (next) {
            request
                .post(uri + '/user/12/pet')
                .type('urlencoded')
                .send('pet=tobi')
                .end(function (err, res) {
                    assert('added pet "tobi"' == res.text, 'response text');
                    next();
                });
        });

        it('request .type() with alias', function (next) {
            request
                .post(uri + '/user/12/pet')
                .type('application/x-www-form-urlencoded')
                .send('pet=tobi')
                .end(function (err, res) {
                    assert('added pet "tobi"' == res.text, 'response text');
                    next();
                });
        });

        it('request .get() with no data or callback', function (next) {
            request.get(uri + '/echo-header/content-type');
            next();
        });

        it('request .send() with no data only', function (next) {
            request.post(uri + '/user/5/pet').type('urlencoded').send('pet=tobi');
            next();
        });

        it('request .send() with callback only', function (next) {
            request
                .get(uri + '/echo-header/accept')
                .set('Accept', 'foo/bar')
                .end(function (err, res) {
                    assert('foo/bar' == res.text);
                    next();
                });
        });

        it('request .accept() with json', function (next) {
            request
                .get(uri + '/echo-header/accept')
                .accept('json')
                .end(function (err, res) {
                    assert('application/json' == res.text);
                    next();
                });
        });

        it('request .accept() with application/json', function (next) {
            request
                .get(uri + '/echo-header/accept')
                .accept('application/json')
                .end(function (err, res) {
                    assert('application/json' == res.text);
                    next();
                });
        });

        it('request .accept() with xml', function (next) {
            request
                .get(uri + '/echo-header/accept')
                .accept('xml')
                .end(function (err, res) {
                    assert('application/xml' == res.text, res.text);
                    next();
                });
        });

        it('request .accept() with application/xml', function (next) {
            request
                .get(uri + '/echo-header/accept')
                .accept('application/xml')
                .end(function (err, res) {
                    assert('application/xml' == res.text);
                    next();
                });
        });

// FIXME: ie6 will POST rather than GET here due to data(),
//        but I'm not 100% sure why.  Newer IEs are OK.
        it('request .end()', function (next) {
            request
                .get(uri + '/echo-header/content-type')
                .set('Content-Type', 'text/plain')
                .send('wahoo')
                .end(function (err, res) {
                    assert('text/plain' == res.text);
                    next();
                });
        });

        it('request .send()', function (next) {
            request
                .get(uri + '/echo-header/content-type')
                .set('Content-Type', 'text/plain')
                .send('wahoo')
                .end(function (err, res) {
                    assert('text/plain' == res.text);
                    next();
                });
        });

        it('request .set()', function (next) {
            request
                .get(uri + '/echo-header/content-type')
                .set('Content-Type', 'text/plain')
                .send('wahoo')
                .end(function (err, res) {
                    assert('text/plain' == res.text);
                    next();
                });
        });

        it('request .set(object)', function (next) {
            request
                .get(uri + '/echo-header/content-type')
                .set({'Content-Type': 'text/plain'})
                .send('wahoo')
                .end(function (err, res) {
                    assert('text/plain' == res.text);
                    next();
                });
        });

        it('POST urlencoded', function (next) {
            request
                .post(uri + '/pet')
                .type('urlencoded')
                .send({name: 'Manny', species: 'cat'})
                .end(function (err, res) {
                    assert('added Manny the cat' == res.text);
                    next();
                });
        });

        it('POST json', function (next) {
            request
                .post(uri + '/pet')
                .type('json')
                .send({name: 'Manny', species: 'cat'})
                .end(function (err, res) {
                    assert('added Manny the cat' == res.text);
                    next();
                });
        });

        it('POST json array', function (next) {
            request
                .post(uri + '/echo')
                .send([1, 2, 3])
                .end(function (err, res) {
                    assert('application/json' == res.header['content-type'].split(';')[0]);
                    assert('[1,2,3]' == res.text);
                    next();
                });
        });

        it('POST json default', function (next) {
            request
                .post(uri + '/pet')
                .send({name: 'Manny', species: 'cat'})
                .end(function (err, res) {
                    assert('added Manny the cat' == res.text);
                    next();
                });
        });

        it('POST multiple .send() calls', function (next) {
            request
                .post(uri + '/pet')
                .send({name: 'Manny'})
                .send({species: 'cat'})
                .end(function (err, res) {
                    assert('added Manny the cat' == res.text);
                    next();
                });
        });

        it('POST multiple .send() strings', function (next) {
            request
                .post(uri + '/echo')
                .send('user[name]=tj')
                .send('user[email]=tj@vision-media.ca')
                .end(function (err, res) {
                    assert('application/x-www-form-urlencoded' == res.header['content-type'].split(';')[0]);
                    assert(res.text == 'user[name]=tj&user[email]=tj@vision-media.ca')
                    next();
                })
        });

        it('POST native FormData', function (next) {
            if (!window.FormData) {
                // Skip test if FormData is not supported by browser
                return next();
            }

            var data = new FormData();
            data.append('foo', 'bar');

            request
                .post(uri + '/echo')
                .send(data)
                .end(function (err, res) {
                    assert('multipart/form-data' == res.type);
                    next();
                });
        });

        it('GET .type', function (next) {
            request
                .get(uri + '/pets')
                .end(function (err, res) {
                    assert('application/json' == res.type);
                    next();
                });
        });

        it('GET Content-Type params', function (next) {
            request
                .get(uri + '/text')
                .end(function (err, res) {
                    assert('utf-8' == res.charset);
                    next();
                });
        });

        it('GET json', function (next) {
            request
                .get(uri + '/pets')
                .end(function (err, res) {
                    assert.deepEqual(res.body, ['tobi', 'loki', 'jane']);
                    next();
                });
        });

        it('GET x-www-form-urlencoded', function (next) {
            request
                .get(uri + '/foo')
                .end(function (err, res) {
                    assert.deepEqual(res.body, {foo: 'bar'});
                    next();
                });
        });

        it('GET shorthand', function (next) {
            request.get(uri + '/foo', function (err, res) {
                assert('foo=bar' == res.text);
                next();
            });
        });

        it('POST shorthand', function (next) {
            request.post(uri + '/user/0/pet', {pet: 'tobi'}, function (err, res) {
                assert('added pet "tobi"' == res.text);
                next();
            });
        });

        it('POST shorthand without callback', function (next) {
            request.post(uri + '/user/0/pet', {pet: 'tobi'}).end(function (err, res) {
                assert('added pet "tobi"' == res.text);
                next();
            });
        });

        it('GET querystring object', function (next) {
            request
                .get(uri + '/querystring')
                .query({search: 'Manny'})
                .end(function (err, res) {
                    assert.deepEqual(res.body, {search: 'Manny'});
                    next();
                });
        });

        it('GET querystring append original', function (next) {
            request
                .get(uri + '/querystring?search=Manny')
                .query({range: '1..5'})
                .end(function (err, res) {
                    assert.deepEqual(res.body, {search: 'Manny', range: '1..5'});
                    next();
                });
        });

        it('GET querystring multiple objects', function (next) {
            request
                .get(uri + '/querystring')
                .query({search: 'Manny'})
                .query({range: '1..5'})
                .query({order: 'desc'})
                .end(function (err, res) {
                    assert.deepEqual(res.body, {search: 'Manny', range: '1..5', order: 'desc'});
                    next();
                });
        });

        it('GET querystring empty objects', function (next) {
            var req = request
                .get(uri + '/querystring')
                .query({})
                .end(function (err, res) {
                    assert.deepEqual(req._query, []);
                    assert.deepEqual(res.body, {});
                    next();
                });
        });

        it('GET querystring with strings', function (next) {
            request
                .get(uri + '/querystring')
                .query('search=Manny')
                .query('range=1..5')
                .query('order=desc')
                .end(function (err, res) {
                    assert.deepEqual(res.body, {search: 'Manny', range: '1..5', order: 'desc'});
                    next();
                });
        });

        it('GET querystring with strings and objects', function (next) {
            request
                .get(uri + '/querystring')
                .query('search=Manny')
                .query({order: 'desc', range: '1..5'})
                .end(function (err, res) {
                    assert.deepEqual(res.body, {search: 'Manny', range: '1..5', order: 'desc'});
                    next();
                });
        });

        it('GET querystring object .get(uri, obj)', function (next) {
            request
                .get(uri + '/querystring', {search: 'Manny'})
                .end(function (err, res) {
                    assert.deepEqual(res.body, {search: 'Manny'});
                    next();
                });
        });

        it('GET querystring object .get(uri, obj, fn)', function (next) {
            request
                .get(uri + '/querystring', {search: 'Manny'}, function (err, res) {
                    assert.deepEqual(res.body, {search: 'Manny'});
                    next();
                });
        });

        it('request(method, url)', function (next) {
            request('GET', uri + '/foo').end(function (err, res) {
                assert('bar' == res.body.foo);
                next();
            });
        });

        it('request(url)', function (next) {
            request(uri + '/foo').end(function (err, res) {
                assert('bar' == res.body.foo);
                next();
            });
        });

        it('request(url, fn)', function (next) {
            request(uri + '/foo', function (err, res) {
                assert('bar' == res.body.foo);
                next();
            });
        });

        it('req.timeout(ms)', function (next) {
            request
                .get(uri + '/delay/3000')
                .timeout(1000)
                .end(function (err, res) {
                    assert(err, 'error missing');
                    assert(1000 == err.timeout, 'err.timeout missing');
                    assert('timeout of 1000ms exceeded' == err.message, 'err.message incorrect');
                    assert(null == res);
                    next();
                })
        })

        it('req.timeout(ms) with redirect', function (next) {
            request
                .get(uri + '/delay/const')
                .timeout(1000)
                .end(function (err, res) {
                    assert(err, 'error missing');
                    assert(1000 == err.timeout, 'err.timeout missing');
                    assert('timeout of 1000ms exceeded' == err.message, 'err.message incorrect');
                    assert(null == res);
                    next();
                });
        });

        window.btoa = window.btoa || null;
        it('basic auth', function (next) {
            window.btoa = window.btoa || require('Base64').btoa;

            request
                .post(uri + '/auth')
                .auth('foo', 'bar')
                .end(function (err, res) {
                    assert('foo' == res.body.user);
                    assert('bar' == res.body.pass);
                    next();
                });
        });

        it('request event', function (next) {
            request
                .get(uri + '/foo')
                .on('request', function (req) {
                    assert(uri + '/foo' == req.url);
                    next();
                })
                .end();
        });

        it('response event', function (next) {
            request
                .get(uri + '/foo')
                .on('response', function (res) {
                    assert('bar' == res.body.foo);
                    next();
                })
                .end();
        });

        it('progress event listener on xhr object registered when some on the request', function () {
            var req = request
                .get(uri + '/foo')
                .on('progress', function (data) {
                })
                .end();

            if (req.xhr.upload) { // Only run assertion on capable browsers
                assert(null !== req.xhr.upload.onprogress);
            }
        });

        it('no progress event listener on xhr object when none registered on request', function () {
            var req = request
                .get(uri + '/foo')
                .end();

            if (req.xhr.upload) { // Only run assertion on capable browsers
                assert(null === req.xhr.upload.onprogress);
            }
        });

// Don't run on browsers without xhr2 support
        if ('FormData' in window) {
            it('xhr2 download file', function (next) {
                request.parse['application/vnd.superagent'] = function (obj) {
                    return obj;
                };

                request
                    .get(uri + '/arraybuffer')
                    .on('request', function () {
                        this.xhr.responseType = 'arraybuffer';
                    })
                    .on('response', function (res) {
                        assert(res.body instanceof ArrayBuffer);
                        next();
                    })
                    .end();
            });
        }

        /*
         Serialize tests
         */

        function serialize(obj, res) {
            var val = request.serializeObject(obj);
            assert(val == res
                , JSON.stringify(obj) + ' to "' + res + '" serialization failed. got: '
                + '"' + val + '"');
        }

        function parse(str, obj) {
            var val = request.parseString(str);
            assert.deepEqual(val
                , obj
                , '"' + str + '" to '
                + JSON.stringify(obj) + ' parse failed. got: '
                + JSON.stringify(val));
        }

        describe('request.serializeObject()', function () {
            it('should serialize', function () {
                serialize('test', 'test');
                serialize('foo=bar', 'foo=bar');
                serialize({foo: 'bar'}, 'foo=bar');
                serialize({foo: null}, '');
                serialize({foo: 'null'}, 'foo=null');
                serialize({foo: undefined}, '');
                serialize({foo: 'undefined'}, 'foo=undefined');
                serialize({name: 'tj', age: 24}, 'name=tj&age=24');
                serialize({name: '&tj&'}, 'name=%26tj%26');
                serialize({'&name&': 'tj'}, '%26name%26=tj');
            });
        });

        describe('request.parseString()', function () {
            it('should parse', function () {
                parse('name=tj', {name: 'tj'});
                parse('name=Manny&species=cat', {name: 'Manny', species: 'cat'});
                parse('redirect=/&ok', {redirect: '/', ok: 'undefined'});
                parse('%26name=tj', {'&name': 'tj'});
                parse('name=tj%26', {name: 'tj&'});
            });
        });


        /*
         xdomain tests
         */

        describe('xdomain', function () {

            //// TODO (defunctzombie) I am not certain this actually forces xdomain request
            //// use localtunnel.me and tunnel127.com alias instead
            //it('should support req.withCredentials()', function (next) {
            //  request
            //      .get('//' + window.location.host + '/xdomain')
            //      .withCredentials()
            //      .end(function (err, res) {
            //        assert(200 == res.status);
            //        assert('tobi' == res.text);
            //        next();
            //      });
            //});

            // xdomain not supported in old IE and IE11 gives weird Jetty errors (looks like a SauceLabs issue)
            var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
            var isIE9OrOlder = !window.atob;
            if (!isIE9OrOlder && !isIE11) { // Don't run on IE9 or older, or IE11
                it('should handle x-domain failure', function (next) {
                    request
                        .get('//tunne127.com')
                        .end(function (err, res) {
                            assert(err, 'error missing');
                            assert(err.crossDomain, 'not .crossDomain');
                            next();
                        });
                });
            }
        });
    }
}