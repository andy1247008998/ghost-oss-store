var util = require('util')
var fs = require('fs')
var path = require('path')
var Promise = require('bluebird')
var OSS = require('ali-oss').Wrapper
var utils = require('./utils')
const urlParse = require('url').parse;
var baseStore = require('ghost-storage-base')

class OssStore extends baseStore {
  constructor (config) {
    super(config)
    this.options = config || {}
    this.client = new OSS(this.options)
  }

  save (file, targetDir) {
    console.log("saving files");
    var client = this.client
    var origin = this.options.origin
    var key = this.getFileKey(file)
    var options = this.options.put.options

    var gzip = zlib.createGzip();
    var r = fs.createReadStream(file.path);

    return new Promise(function (resolve, reject) {
      return client.put(
        key,
        r.pipe(gzip),
        options
      )
      .then(function (result) {
        // console.log(result)
        if(origin){
          resolve(utils.joinUrl(origin, result.name))
        }else{
          resolve(result.url)
        }
      })
      .catch(function (err) {
        // console.log(err)
        reject(false)
      })
    })
  }

  exists (filename) {
    console.log("Hello World2");
    // console.log('exists',filename)
    var client = this.client  
  
    return new Promise(function (resolve, reject) {
      return client.head(filename).then(function (result) {
        // console.log(result)
        resolve(true)
      }).catch(function (err) {
        // console.log(err)
        reject(false)
      })
  
    })
  }
  
  serve (options) {
    console.log("Hello World3");
    return function (req, res, next) {
      next();
    }
  }
  
  delete (filename) {
    console.log("Hello World4");
    var client = this.client  
  
    // console.log('del',filename)
    return new Promise(function (resolve, reject) {
      return client.delete(filename).then(function (result) {
        // console.log(result)
        resolve(true)
      }).catch(function (err) {
        // console.log(err)
        reject(false)
      })
    })
  }

  read(options) {
   console.log("Hello World5");
   options = options || {};

    const client = this.client;
    const key = urlParse(options.path).pathname.slice(1);

    return new Promise(function(resolve, reject) {

        resolve(content);
  
    });
  }
 
  getFileKey (file) {
    console.log("Hello World6");
    var keyOptions = this.options.fileKey
  
    if (keyOptions) {
      var getValue = function (obj) {
        return typeof obj === 'function' ? obj() : obj
      };
      var ext = path.extname(file.name)
      var name = path.basename(file.name, ext)
  
      if (keyOptions.safeString) {
        name = utils.safeString(name)
      }
  
      if (keyOptions.prefix) {
        name = path.join(keyOptions.prefix, name);
      }
  
      if (keyOptions.suffix) {
        name += getValue(keyOptions.suffix)
      }
  
      return name + ext.toLowerCase();
    }
  
    return null;
  }
}

module.exports = OssStore
