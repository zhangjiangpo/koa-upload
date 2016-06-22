
/**
 * Module dependencies.
 */

var logger = require('koa-logger');
var serve = require('koa-static');
var parse = require('co-busboy');
var koa = require('koa');
var fs = require('fs');
var app = new koa();
var os = require('os');
var path = require('path');
var bodyParse = require('koa-better-body')

// log requests

app.use(logger());

app.use(bodyParse())

app.use(function *(next) {
  this.params = this.body?this.body:'';
  yield next;
})
// custom 404

app.use(function *(next){
  yield next;
  if (this.body || !this.idempotent) return;
  this.redirect('/404.html');
});

// serve files from ./public

app.use(serve(__dirname + '/public'));

// handle uploads

app.use(function *(next){
  // ignore non-POSTs
  if ('POST' != this.method) return yield next;

  // multipart upload
  var files = this.params.files;
  if(files){
    for(var item in files){
      var tmpath = files[item]['path'];
      var tmparr = files[item]['name'].split('.');
      var ext ='.'+tmparr[tmparr.length-1];
      var newpath =path.join(__dirname+'/file', Math.random().toString()+ext);
      var stream = fs.createWriteStream(newpath);//创建一个可写流
      fs.createReadStream(tmpath).pipe(stream);//可读流通过管道写入可写流
    }
  }
  this.redirect('/');
});

// listen

app.listen(3000);
console.log('listening on port 3000');
