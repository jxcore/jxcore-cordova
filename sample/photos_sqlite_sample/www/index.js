(function check() {
    if (typeof jxcore === 'undefined') {
        setTimeout(check, 5);
    } else {
        jxcore.isReady(function () {
            jxcore('alert').register(alert);
            jxcore('app.js').loadMainFile(function(result, err) {
                if (err) {
                    alert(err);
                } else {
                    jxcore('getPhotoUrls').call(function (err, urls) {
                        init(urls);
                    });
                }
            });
        });
    }
})();

var slider;

function init(urls) {
    // initialize slider
    slider = jQuery('#slider').slick({
        infinite: true,
        speed: 300,
        slidesToShow: 1
    });

    // add photos
    urls.forEach(addPhotoToSlider);

    // take photo button
    document.getElementById('takePhoto').addEventListener('click', takeAndSavePhoto);
}

function addPhotoToSlider(url) {
    slider.slick('slickAdd', '<div><img width="100%" src="' + url + '"/></div>');
}

function takeAndSavePhoto() {
    navigator.camera.getPicture(function (data) {
        jxcore('savePhoto').call(data, function (err, url) {
            if (err) {
                alert(err);
            } else {
                addPhotoToSlider(url);
                slider.slick('slickNext');
            }
        });
    }, function () {
        alert('Taking photo failed: ' + err);
    }, {
        quality: 25,
        destinationType : navigator.camera.DestinationType.DATA_URL,
        sourceType: navigator.camera.PictureSourceType.CAMERA,
        encodingType: navigator.camera.EncodingType.JPEG,
        targetwidth: 900,
        targetHeight: 900,
        correctOrientation: true
    });
}
