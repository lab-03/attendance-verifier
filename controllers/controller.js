import fetch from "node-fetch";
import Util from "../utils/Utils";
const util = new Util();

class Controller {
  request(url, method, body, res) {
    let statusCode = 200;
    let options = {
      method,
      headers: { "Content-Type": "application/json" }
    };
    if (method !== "get" && body)
      options = Object.assign({ body: JSON.stringify(body) }, options);
    console.log(options);
    fetch(url, options)
      .then(response => {
        statusCode = response.status;
        return response.json();
      })
      .then(response => {
        if (response.status === "success")
          util.setSuccess(statusCode, response.message, response.data);
        else util.setError(statusCode, response.message);
        console.log(response.message);
        return util.send(res);
      })
      .catch(err => {
        console.error(err);
        util.setError(500, "OOps! something happened");
        return util.send(res);
      });
  }
  getQrCode(req, res) {
    const { body } = req;
    this.request(
      "https://gp-qrcode.herokuapp.com/api/qrcodes/create",
      "post",
      body,
      res
    );
  }
  invalidate(req, res) {
    const { body } = req;
    this.request(
      "https://gp-qrcode.herokuapp.com/api/qrcodes/end",
      "post",
      body,
      res
    );
  }
  attendByQr(req, res) {
    const { body } = req;
    this.request(
      "https://gp-qrcode.herokuapp.com/api/qrcodes/attend",
      "post",
      body,
      res
    );
  }
  attendByFR(req, res) {
    let options = {
      method: "POST",
      url: "https://fr-api.herokuapp.com/verify",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req.body)
    };
    fetch(url, options)
      .then(response => {
        response.json();
      })
      .then(response => {
        const temp = JSON.parse(response.body).same_person;
        if (temp === true) {
          util.setSuccess(response.statusCode, temp);
        } else if (temp === false) {
          util.setError(400, temp);
        }
        return util.send(res);
      })
      .catch(err => {
        console.error(err);
        util.setError(500, "OOps! something happened");
        return util.send(res);
      });
  }
}
const mainController = new Controller();
export default mainController;
