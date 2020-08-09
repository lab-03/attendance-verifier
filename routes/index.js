import { Router } from "express";
import Controller from "../controllers/controller";
const routes = Router();

routes.post("/qrcodes/verify", (req, res) => Controller.verify(req, res));
routes.post("/qrcodes/create", (req, res) => Controller.getQrCode(req, res));
routes.put("/qrcodes/end", (req, res) => Controller.invalidate(req, res));
routes.post("/fr", (req, res) => Controller.attendByFR(req, res));
routes.post("/attend", (req, res) => Controller.saveAndNotify(req, res));

export default routes;
