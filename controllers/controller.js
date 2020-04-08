const request = require("request");
import Util from "../utils/Utils";
const getImage = require('../utils/imageDownload');
const util = new Util();
const fs = require('fs');
const path = require('path');

class Controller {
  async getAllQrCodes(req, res) {
    await request.get("http://localhost:5000/api/qrcodes/", function(
      err,
      response,
      body
    ) {
      if (response.statusCode === 200) {
        util.setSuccess(
          response.statusCode,
          JSON.parse(body).message,
          JSON.parse(body).data
        );
      } else if (err || response.statusCode !== 200) {
        util.setError(response.statusCode, JSON.parse(body).message);
      }
      return util.send(res);
    });
  }
  async getQrCode(req, res) {
    const { body } = req;
    await request.post(
      "http://localhost:5000/api/qrcodes/create",
      { form: body },
      function(err, response, body) {
        if (response.statusCode === 200) {
          util.setSuccess(
            response.statusCode,
            JSON.parse(body).message,
            JSON.parse(body).data
          );
        } else if (err || response.statusCode !== 200) {
          util.setError(response.statusCode, JSON.parse(body).message);
        }
        return util.send(res);
      }
    );
  }
  async attend(req, res) {
    const { body } = req;
    await request.post(
      "http://localhost:5000/api/qrcodes/attend",
      { form: body },
      function(err, response, body) {
        if (response.statusCode === 200) {
          util.setSuccess(response.statusCode, JSON.parse(body).message);
        } else if (err || response.statusCode !== 200) {
          util.setError(response.statusCode, JSON.parse(body).message);
        }
        return util.send(res);
      }
    );
  }
  async attendByFR (req,res){
    const uri1 = req.body.original;
    const uri2 = req.body.captured;
    try{
      await getImage(uri1,'original.jpeg');
      await getImage(uri2,'captured.jpeg');
    }
    catch(e){
      return res.status(400).send(e);
    }
   
    var options = {
      'method': 'POST',
      'url': 'https://fr-api.herokuapp.com/',
      'headers': {
      },
      formData: {
      'original': {
          'value': fs.createReadStream(path.join(__dirname,'/../original.jpeg')),
          'options': {
          'filename': 'original.jpeg',
          'contentType': null
          }
      },
      'captured': {
          'value': fs.createReadStream(path.join(__dirname,'/../captured.jpeg')),
          'options': {
          'filename': 'captured.jpeg',
          'contentType': null
              }
          }
      }
      };
      request(options, function(err, response, body) {
        const temp = JSON.parse(body).same_face;
        if (temp === true) {
          util.setSuccess(response.statusCode, temp);
        } else if (err || temp ===false) {
          util.setError(400, temp);
        }
        return util.send(res);
      });
    
  }
}
const mainController = new Controller();
export default mainController;
