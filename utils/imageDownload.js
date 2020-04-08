const request = require('request');
const fs = require('fs');
const get =  (uri,filename)=> {
    return new Promise((resolve, reject) => {
           try{ request.head(uri, function(err, res, body){
            request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
          });}
          catch(e){
            reject("The URL is not working!");
          }
    });
}

module.exports = get;
