var request = require('supertest')
    , should = require('should')
    , cookieparser = require("../cookie-parser.js");

describe('request.agent(app)', function(){

    var agent = request.agent(cookieparser.app);

    it('should save cookies', function(done){
        agent
            .get('/')
            .expect('set-cookie', 'cookie=hey; Path=/', done);
    });

    it('should send cookies', function(done){
        agent
            .get('/return')
            .expect('hey', done);
    });
});

//$ mocha mocha-supertest.js