
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

var router = require('koa-router')();

// log requests

app.use(logger());

app.use(bodyParse())

app.use(function *(next) {
  this.parames = this.method.toUpperCase() !== 'GET'?this.body:this.query;
  yield next;
})

// serve files from ./public

app.use(serve(__dirname + '/public'));

// handle uploads

router.post('/upload',function *(next){

  // multipart upload
  var files = this.parames.files;
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
  //this.redirect('/');
  this.body = {success:true};
});

router.post('/user',function *(next){
  console.dir(this.parames);
  this.body = this.parames;
})
router.get('/user/:id',function *(next){
  console.log(this.parames);
  this.body = Object.assign({},this.parames,this.params);
})

app.use(router.routes())
app.use(router.allowedMethods())
// listen

app.listen(3000);
console.log('listening on port 3000');
