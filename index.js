var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs');
var md5 = require('md5');
var path = require('path');
var urlx = require('url');

var flickrX = require("flickrapi");
var flickrOptions = {
    api_key: "770751f3275ea71592ca2215c3f6004d",
    secret: "f925f10ed7c99698"
};

var dataPath = "datas/";
var photoIds = "photoids/";

var perPage = 100;
var totalListPhotosPage = 1;
var apiKey = "75604504fc80359d82970fb4e1532190";
var userId = "01april";

flickrX.authenticate(flickrOptions, function(error, flickr) {
    getListPhotos(flickr, 1);
});

function download(url, filename, callback){
    request.head(url, function(err, res, body){
        request(url).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function downloadNoNeedName (url, folder, callback) {
    let parsed = urlx.parse(url);
    let fileName = folder + path.basename(parsed.pathname);
    setTimeout(function() {
        download(url, fileName, function() {
            callback();
            console.log(fileName + " downloaded.!");
        });
    }, 0);
}

function getListPhotos(flickrObj, curPage) {
    if(curPage > totalListPhotosPage) {
        // toi han
        console.log("Done !!!");
    } else {
        flickrObj.people.getPhotos({
            "format" : "json",
            "api_key" : apiKey,
            "per_page" : perPage,
            "authenticated" : true,
            "page" : curPage,
            "user_id" : userId
        }, function(err, result) {
            if (err) {
                console.log("Error : " + err);
                console.log("Retry get list photos.!!");
                setTimeout(function() {
                    getListPhotos(flickrObj, curPage);
                })
            } else {
                var obj = result;
                totalListPhotosPage = Math.ceil((obj.photos.total * 1.0) / perPage);
                
                console.log("Current process ===========");
                console.log("Page : " + curPage + " / " + totalListPhotosPage + " pages");
                var photos = obj.photos.photo;

                processPhotos(flickrObj, photos, 1, curPage);
                
            }
        });
    }
}

function processPhotos(flickrObj, photos, indx, pageOfPhotosList) {
    if(photos.length == indx) {
        var nextPage = pageOfPhotosList + 1;
        getListPhotos(flickrObj, nextPage);
    } else {
        var curPhoto = photos[indx];
        if (curPhoto == undefined) {

        }
        console.log("Process for photo with id : " + curPhoto.id);
        console.log("Status item : " + indx + "/" + photos.length + " items");
        var photoIdFile = photoIds + curPhoto.id;
        if(fs.existsSync(photoIdFile)) {
            console.log("File exists!");
            processPhotos(flickrObj, photos, indx + 1, pageOfPhotosList);
        } else {
            console.log("Starting to download!");
            flickrObj.photos.getSizes({
                "format" : "json",
                "api_key" : apiKey,
                "photo_id" : curPhoto.id,
                "authenticated" : true
            }, function(err, result) {
                if (err) {
                    console.log("Error. " + err);
                    console.log("Retry index : " + indx + " now !!!")
                    setTimeout(function() {
                        processPhotos(flickrObj, photos, indx, pageOfPhotosList);
                    }, 3000);
                } else {
                    var obj = result;
                    if(obj.stat == "ok") {
                        var sizes = obj.sizes.size;
                        if(sizes.length > 0) {
                            var lastItem = sizes[sizes.length - 1];
                            downloadNoNeedName (lastItem.source, dataPath, function(){
                                fs.writeFileSync(photoIdFile, "");
                            })
                        }
                    }
                    processPhotos(flickrObj, photos, indx + 1, pageOfPhotosList);
                }
            });
        }
    }
}
