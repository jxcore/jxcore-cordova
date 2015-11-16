/**
 * Created by deefactorial on 18/05/15.
 */

var express = require('express')
    , cookieParser = require('cookie-parser');

var app = express();

app.use(cookieParser());

app.get('/', function(req, res){
    res.cookie('cookie', 'hey');
    res.send();
});

app.get('/return', function(req, res){
    if (req.cookies.cookie) res.send(req.cookies.cookie);
    else res.send(':(')
});

/**
 * Start the Express server.
 */
function start(){
    var port = process.env.PORT || config.server.port;
    app.listen(port);
    console.log("server pid %s listening on port %s in %s mode",
        process.pid,
        port,
        app.get('env')
    );
}


/**
 * Only start server if this script is executed, not if it's require()'d.
 * This makes it easier to run integration tests on ephemeral ports.
 */
if (require.main === module) {
    start();
}

exports.app = app;