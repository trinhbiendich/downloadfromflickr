var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs');
var md5 = require('md5');
var path = require('path');
var urlx = require('url');
var dateFormat = require('dateformat');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

var flickrX = require("flickrapi");
var apiKey = "3be1f78e4ffd684826b296bb02f03597";
var apiSecret = "2c59104f7a62cf18";
var userId = "nguyenthientri";
userId = "21593958@N02";
userId = "avarouge";
userId = "134120532@N07";
userId = "125277580@N05";
userId = "130871560@N05";
userId = "156061322@N07";
userId = "129783730@N08";
userId = "chuoihotrung";
userId = "kienk2s";
userId = "155341000@N03";
userId = "136491103@N08";
userId = "148094993@N08";
userId = "jasoncut";

userId = "160750797@N08";
userId = "smooth_couple";
userId = "131512338@N02"; // su ngao
userId = "128052694@N02"; // Tran Hoang Tuan
userId = "h2-studio";
userId = "tunglamphotography";
userId = "159183465@N07";
userId = "149678058@N02";
userId = "sonicxpx";
userId = "trungmuoi89";
userId = "pe3";
userId = "88641078@N02";
userId = "binhdoan";
userId = "155625187@N08";
userId = "beautycz";
userId = "159790050@N04";
userId = "137159220@N06"; // ppppeterbc
userId = "158109512@N06"; // Tuan Anh
userId = "zosomb";        // zoso_bad wolf
userId = "75691184@N07";
userId = "88641078@N02";
userId = "111636373@N07"; //Long Pham
userId = "110193463@N04"; //Kendy Nguyễn
userId = "132902449@N08"; //Quang Trần Ngọc
userId = "146660365@N05"; //Nguyễn Văn Thủy
userId = "134118540@N04"; // Nhut nhut
userId = "144411684@N07"; // Teo David
userId = "99002729@N07"; // Robin Huang
//userId = "120570187@N03"; // julie sachs
//userId = "150026643@N05"; // Kerry Parry
//userId = "147328511@N05";
//userId = "99135124@N00";
//userId = "63560570@N07";
//userId = "154791975@N06"; //  Nguyen Long
//userId = "139411529@N06"; // Hoang Khung
//userId = "159790050@N04"; // Huy Le
//userId = "168429883@N02"; // Hoang Thai
//userId = "164761985@N05"; // Chen Le
//userId = "lx3_sex_photographs";
//userId = "147593085@N05"; // Lucy Nguyen
//userId = "91933991@N02"; // Michelle
//userId = "116135263@N04"; // sawadee's art works



var pageStart = 1; // default 1
var firstStart = true;

var flickrOptions = {
    api_key: apiKey,
    secret: apiSecret
};

var rootPath = "datas/";
var dataPath = "datas/";
var pausePath = "pause";
var photoIds = "photoids/";
var perPage = 100;
var totalListPhotosPage = 1;

var imgs = [];
var pause = false;
var inProcess = true;

var concurentDownload = 0;

var abcObj = null;
var abcCurPage = null;

var authFile = "auth/" + dateFormat(new Date(), "yyyy-mm") + ".json";

if(fs.existsSync(authFile)) {
    console.log("Load config from file");
    flickrOptions = JSON.parse(fs.readFileSync(authFile, 'utf8'));
    xx();
} else {
    flickrX.authenticate(flickrOptions, function(err, flickr) {
        if(err) {
            console.log("can't login");
        } else {
            flickrOptions = {
                api_key: apiKey,
                secret: apiSecret,
                user_id: flickr.options.user_id,
                access_token: flickr.options.access_token,
                access_token_secret: flickr.options.access_token_secret
            }
            fs.writeFileSync(authFile, JSON.stringify(flickrOptions, null, 2) , 'utf-8');
            xx();
        }
    });
}

function xx() {
    flickrX.authenticate(flickrOptions, function(error, flickr) {
        abcObj = flickr;
        getListPhotos(flickr, pageStart);
        let xxDe = setInterval(function() {
            if(imgs.length > 0 && concurentDownload <= 50) {
                let nextItem = imgs.shift();
                concurentDownload++;
                console.log("Status concurent download: " + concurentDownload + " queue : " + imgs.length);
                downloadNoNeedName (nextItem.source, dataPath, function(){
                    fs.writeFileSync(nextItem.photoIdFile, "");
                });
            } else if(imgs.length > 0){
                console.log("Status concurent download: " + concurentDownload + " queue : " + imgs.length);
            }
            
            if (concurentDownload > 90) {
                pause = true;
                inProcess = false;
            } else {
                pause = false;
                if(!inProcess && !fs.existsSync(pausePath)){
                    inProcess = true;
                    getListPhotos(abcObj, abcCurPage);
                }
            }
        }, 300);
    });
}

function download(url, filename, callback){
    request.head(url, function(err, res, body){
        request(url).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function downloadNoNeedName(url, folder, callback) {
    let parsed = urlx.parse(url);
    let fileName = folder + path.basename(parsed.pathname);
    fs.appendFileSync('bash/' + userId + '.sh', 'wget "' + url + '" -O ../' + fileName + '\n');
    fs.appendFileSync('bash/' + userId + '.txt', url + '\n');
    setTimeout(function() {
        callback();
        if(concurentDownload > 0){
            concurentDownload = concurentDownload - 1;
        }
    }, 0);
}

function downloadNoNeedNameBK(url, folder, callback) {
    let parsed = urlx.parse(url);
    let fileName = folder + path.basename(parsed.pathname);
    
    setTimeout(function() {
        download(url, fileName, function() {
            callback();
            if(concurentDownload > 0){
                concurentDownload = concurentDownload - 1;
            }
        });
    }, 0);
}

function getListPhotos(flickrObj, curPage) {
    abcCurPage = curPage;
    dataPath = rootPath + userId + "/";
    if(!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath);
    }
    if((curPage > totalListPhotosPage) && !firstStart) {
        // toi han
        console.log("Done !!!");
        readline.question(`The name to download? :`, (name) => {
          console.log(`Downloading for .. ${name}`)
          userId = name;
          readline.close();
          firstStart = true;
          getListPhotos(flickrObj, 1);
        })
    } else if(!pause && !fs.existsSync(pausePath)){
        firstStart = false;
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
        var photoIdFile = photoIds + curPhoto.id;
        if(fs.existsSync(photoIdFile)) {
            console.log("File exists!");
            processPhotos(flickrObj, photos, indx + 1, pageOfPhotosList);
        } else {
            //console.log("Starting to download!");
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
                            imgs[imgs.length] = {
                                "source" : lastItem.source,
                                "photoIdFile" : photoIdFile
                            };
                        }
                    }
                    
                    processPhotos(flickrObj, photos, indx + 1, pageOfPhotosList);
                }
            });
        }
    }
}

