var request = require("request");
var cheerio = require("cheerio");
var fs = require('fs');
var md5 = require('md5');
var path = require('path');
var urlx = require('url');
var dateFormat = require('dateformat');

var flickrX = require("flickrapi");
var apiKey = "75604504fc80359d82970fb4e1532190";
var apiSecret = "f925rff10ed7c99698";
var userId = "01april";
var authFile = "auth/" + dateFormat(new Date(), "yyyy-mm-dd-H") + ".json";

console.log(authFile);