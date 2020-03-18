const server = require("../server");
import chai from "chai";
import chaiHttp from "chai-http";
import crypto from "crypto";
import assert from "assert";

chai.use(chaiHttp);
chai.should();

describe("QrCodes", () => {
  describe("GET /api/qrcodes", () => {
    it("should get all QrCodes", done => {
      chai
        .request(server)
        .get("/api/qrcodes")
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  let hash = crypto.randomBytes(20).toString("hex"),
    longitude = "10.807222",
    latitude = "-90.985722",
    date = new Date();

  describe("POST /api/qrcodes/create", () => {
    it("should create and save a QrCode in the database", done => {
      let data = {
        hash,
        longitude,
        latitude,
        date
      };
      chai
        .request(server)
        .post("/api/qrcodes/create")
        .send(data)
        .end((err, res) => {
          res.should.have.status(200);
          assert.equal(res.body.message, "QrCode created");
          if (err) done(err);
          else done();
        });
    });
  });
  describe("POST /api/qrcodes/create", () => {
    it("should fail to save the QrCode in the database because the same hash exists", done => {
      let data = {
        hash,
        longitude,
        latitude,
        date
      };
      chai
        .request(server)
        .post("/api/qrcodes/create")
        .send(data)
        .end((err, res) => {
          res.should.have.status(400);
          assert.equal(res.body.message.name, "SequelizeUniqueConstraintError");
          if (err) done(err);
          else done();
        });
    });
  });
  describe("POST /api/qrcodes/attend", () => {
    it("should attend a student", done => {
      let data = {
        hash,
        longitude,
        latitude,
        date
      };
      chai
        .request(server)
        .post("/api/qrcodes/attend")
        .send(data)
        .end((err, res) => {
          res.should.have.status(200);
          assert.equal(res.body.message, "Attendance has been recorded");
          if (err) done(err);
          else done();
        });
    });
  });
  describe("POST /api/qrcodes/attend", () => {
    it("should NOT attend a student because the QrCode doesn't exist", done => {
      let data = {
        hash: " ",
        longitude,
        latitude,
        date
      };
      chai
        .request(server)
        .post("/api/qrcodes/attend")
        .send(data)
        .end((err, res) => {
          res.should.have.status(404);
          assert.equal(res.body.message, "No qrCode found");
          if (err) done(err);
          else done();
        });
    });
  });
  describe("POST /api/qrcodes/attend", () => {
    it("should NOT attend a student because the location is too far", done => {
      let data = {
        hash,
        longitude: "11.807222",
        latitude,
        date
      };
      chai
        .request(server)
        .post("/api/qrcodes/attend")
        .send(data)
        .end((err, res) => {
          res.should.have.status(400);
          assert.equal(res.body.message, "Your location is too far");
          if (err) done(err);
          else done();
        });
    });
  });
  describe("POST /api/qrcodes/attend", () => {
    it("should NOT attend a student because the location is too far", done => {
      let data = {
        hash,
        longitude,
        latitude: "-91.985722",
        date
      };
      chai
        .request(server)
        .post("/api/qrcodes/attend")
        .send(data)
        .end((err, res) => {
          res.should.have.status(400);
          assert.equal(res.body.message, "Your location is too far");
          if (err) done(err);
          else done();
        });
    });
  });
});
