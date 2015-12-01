var sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database(':memory:');

db.serialize(function () {
    db.run('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY, image Blob)');
});

Mobile('savePhoto').registerAsync(function (data, callback) {
    var query = 'INSERT INTO photos (id, image) VALUES (NULL, ?)';
    var buffer = new Buffer(data, 'base64');
    db.run(query, buffer, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, 'data:image/jpeg;base64,' + data);
        }
    });
});

Mobile('getPhotoUrls').registerAsync(function (callback) {
    db.all('SELECT image FROM photos', function (err, records) {
        if (err) {
            log(err);
        } else {
            callback(null, records.map(function (record) {
                return 'data:image/jpeg;base64,' + record.image.toString('base64');
            }));
        }
    });
});

function log(text) {
    Mobile('alert').call(text);
}