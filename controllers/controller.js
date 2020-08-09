import fetch from "node-fetch";
import Util from "../utils/Utils";
import "../database/models/index";
import EventEmitter from "events";
import attendeesModel from "../database/models/attendees";
const util = new Util();

class Controller extends EventEmitter {
  request(url, method, body, res) {
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
  async saveAndNotify(req, res) {
    const { hash, newAttendee } = req.body;
    try {
      let attendee = await this.saveAttendee({ hash, newAttendee });
      console.log(attendee);
      if (attendee) {
        this.emit("send attendee", attendee);
        util.setSuccess(200, "new attendee has been added to the list", {
          attendee
        });
        util.send(res);
        return 1;
      }
    } catch (err) {
      util.setError(500, err);
      util.send(res);
      return 0;
    }
  }

  async saveAttendee({ hash, newAttendee }) {
    let attendee = new attendeesModel({
      id: newAttendee.id,
      name: newAttendee.name,
      hash,
      FRScore: newAttendee.FRScore || 100
    });
    let res = await attendeesModel.find(
      { id: attendee.id, hash: attendee.hash },
      (err, res) => {
        return res;
      }
    );
    console.log("res: ", res.length);
    if (res.length === 0) {
      attendee.save(err => {
        if (err) throw err;
      });
    }
    return attendee;
  }

  async updateAttendee(oldAttendee, updatedAttendee) {
    console.log("updating", oldAttendee);
    try {
      const res = await attendeesModel.updateOne(
        { _id: oldAttendee._id },
        updatedAttendee,
        (err, res) => {
          console.log(`updated ${res.nModified} records`);
          if (err) throw err;
        }
      );
      if (res.ok) return 1;
      return 0;
    } catch (err) {
      console.err(err);
      return 0;
    }
  }
  async deleteAttendee(attendee) {
    console.log("deleting", attendee);
    try {
      const res = await attendeesModel.deleteOne(attendee, (err, res) => {
        if (err) throw err;
      });
      if (res.ok) return 1;
      return 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  }
  async getAttendees(hash) {
    try {
      attendeesModel.find({ hash }, (err, res) => {
        if (err) throw err;
        if (res.length) this.emit("send attendees", res);
      });
    } catch (err) {
      console.error(err);
      return 0;
    }
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
      "put",
      body,
      res
    );
  }
  verify(req, res) {
    const {
      hash,
      longitude,
      latitude,
      original_face,
      captured_face
    } = req.body;
    try {
      this.verifyQr({ hash, longitude, latitude }, (statusCode, message) => {
        if (statusCode === 200) {
          console.log("Qr check success");
          if (original_face && captured_face) {
            this.verifyFaceRec(
              { original_face, captured_face },
              (frStatusCode, samePerson, FRScore) => {
                if (frStatusCode === 200 && samePerson) {
                  console.log("face recognition check success");
                  console.log(samePerson, frStatusCode);
                  util.setSuccess(frStatusCode, message, { FRScore });
                  return util.send(res);
                } else if (!samePerson) {
                  util.setError(400, "face recognition check failed");
                  return util.send(res);
                }
              }
            );
          } else {
            util.setSuccess(statusCode, message);
            return util.send(res);
          }
        } else {
          console.log("Qr check failed");
          util.setError(statusCode, message);
          return util.send(res);
        }
      });
    } catch (err) {
      console.log(err);
      util.setError(500, "OOps! something happened");
      return util.send(res);
    }
  }
  verifyQr(data, cb) {
    let options = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    };
    let statusCode = 200;
    fetch("https://gp-qrcode.herokuapp.com/api/qrcodes/attend", options)
      .then(response => {
        statusCode = response.status;
        return response.json();
      })
      .then(response => {
        cb(statusCode, response.message);
      })
      .catch(err => {
        console.error(err);
        util.setError(500, "OOps! something happened");
        return util.send(res);
      });
  }
  verifyFaceRec(data, cb) {
    let options = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    };
    let statusCode = 200;
    fetch("https://fr-api.herokuapp.com/verify", options)
      .then(response => {
        statusCode = response.status;
        return response.json();
      })
      .then(response => {
        const { same_person, same_person_accuracy } = response;
        if (same_person === true) {
          // util.setSuccess(statusCode, same_person);
          cb(statusCode, same_person, same_person_accuracy);
        } else if (same_person === false) {
          cb(400, same_person);
          // util.setError(400, same_person);
        }
        // return util.send(res);
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
