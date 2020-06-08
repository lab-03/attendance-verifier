import fetch from "node-fetch";
import Util from "../utils/Utils";
import "../database/models/index";
import EventEmitter from "events";
import attendeesModel from "../database/models/attendees";
const util = new Util();

class Controller extends EventEmitter {
  request(url, method, body, res, func = null) {
    let statusCode = 200;
    let options = {
      method,
      headers: { "Content-Type": "application/json" }
    };
    if (method !== "get" && body)
      options = Object.assign({ body: JSON.stringify(body) }, options);
    fetch(url, options)
      .then(response => {
        statusCode = response.status;
        return response.json();
      })
      .then(response => {
        if (statusCode === 200) {
          util.setSuccess(statusCode, response.message, response.data);
          if (func === "attendByQr") this.saveAndNotify(body);
          else if (func === "invalidate") this.sendEndEvent(body);
        } else util.setError(statusCode, response.message);
        console.log(response.message);
        return util.send(res);
      })
      .catch(err => {
        console.error(err);
        util.setError(500, "OOps! something happened");
        return util.send(res);
      });
  }
  sendEndEvent({ hash }) {
    this.emit("end", hash);
    return 1;
  }
  saveAndNotify({ hash, student }) {
    let attendee = new attendeesModel({
      id: student.id,
      name: student.name,
      hash,
      FRScore: student.FRScore
    });
    attendee.save((err, attendee) => {
      if (err) throw err;
      this.emit("send attendee", { attendee });
      return 1;
    });
  }
  getQrCode(req, res) {
    const { body } = req;
    console.log(body);

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
      res,
      "invalidate"
    );
  }
  attendByQr(req, res) {
    const { body } = req;
    this.request(
      "https://gp-qrcode.herokuapp.com/api/qrcodes/attend",
      "post",
      body,
      res,
      "attendByQr"
    );
  }
  attendByFR(req, res) {
    let options = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req.body)
    };
    let statusCode = 200;
    fetch("https://fr-api.herokuapp.com/verify", options)
      .then(response => {
        statusCode = response.status;
        return response.json();
      })
      .then(response => {
        const temp = response.same_person;
        if (temp === true) {
          util.setSuccess(statusCode, temp);
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
const controller = new Controller();
export default controller;
