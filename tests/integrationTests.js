const server = require("../server");
import chai from "chai";
import chaiHttp from "chai-http";
import crypto from "crypto";
import assert from "assert";

chai.use(chaiHttp);
chai.should();

let hash = crypto.randomBytes(20).toString("hex"),
  longitude = "10.807222",
  latitude = "-90.985722";

describe("POST /api/qrcodes/create", () => {
  it("should create and save a QrCode in the database", done => {
    let data = {
      hash,
      longitude,
      latitude
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
  it("should fail to save the QrCode in the database because the same hash exists", done => {
    let data = {
      hash,
      longitude,
      latitude
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

describe("POST /api/qrcodes/verify", () => {
  it("should attend a student", done => {
    let data = {
      hash,
      longitude,
      latitude
    };
    chai
      .request(server)
      .post("/api/qrcodes/verify")
      .send(data)
      .end((err, res) => {
        res.should.have.status(200);
        assert.equal(res.body.message, "Attendance request has been verified");
        if (err) done(err);
        else done();
      });
  });
  it("should NOT attend a student because the QrCode doesn't exist", done => {
    let data = {
      hash: " ",
      longitude,
      latitude
    };
    chai
      .request(server)
      .post("/api/qrcodes/verify")
      .send(data)
      .end((err, res) => {
        res.should.have.status(404);
        assert.equal(res.body.message, "No qrCode found");
        if (err) done(err);
        else done();
      });
  });
  it("should NOT attend a student because the location is too far", done => {
    let data = {
      hash,
      longitude: "11.807222",
      latitude
    };
    chai
      .request(server)
      .post("/api/qrcodes/verify")
      .send(data)
      .end((err, res) => {
        res.should.have.status(400);
        assert.equal(res.body.message, "Your location is too far");
        if (err) done(err);
        else done();
      });
  });

  it("should NOT attend a student because the location is too far", done => {
    let data = {
      hash,
      longitude,
      latitude: "-91.985722"
    };
    chai
      .request(server)
      .post("/api/qrcodes/verify")
      .send(data)
      .end((err, res) => {
        res.should.have.status(400);
        assert.equal(res.body.message, "Your location is too far");
        if (err) done(err);
        else done();
      });
  });
});

describe("PUT /api/qrcodes/end", () => {
  let tempHash = crypto.randomBytes(20).toString("hex");
  before(function(done) {
    let data = {
      hash: tempHash,
      longitude,
      latitude
    };
    chai
      .request(server)
      .post("/api/qrcodes/create")
      .send(data)
      .end((err, res) => {
        done();
      });
  });
  it("should successfully invalidate a qrCode", done => {
    let data = {
      hash: tempHash
    };
    chai
      .request(server)
      .put("/api/qrcodes/end")
      .send(data)
      .end((err, res) => {
        res.should.have.status(200);
        assert.equal(res.body.message, "QrCode has been invalidated");
        if (err) done(err);
        else done();
      });
  }),
    it("should fail at invalidating the QrCode because it doesn't exist", done => {
      let data = {
        hash: crypto.randomBytes(20).toString("hex")
      };
      chai
        .request(server)
        .put("/api/qrcodes/end")
        .send(data)
        .end((err, res) => {
          res.should.have.status(404);
          assert.equal(res.body.message, "No qrCode found");
          if (err) done(err);
          else done();
        });
    });
});
