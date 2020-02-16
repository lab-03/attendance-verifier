const request = require("request");
import Util from "../utils/Utils";

const util = new Util();

class Controller {
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
    await request.get(
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
}
const mainController = new Controller();
export default mainController;
