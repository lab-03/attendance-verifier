import { Router } from "express";
import Controller from "../controllers/controller";
const routes = Router();

routes.post("/qrcodes/attend", Controller.attendByQr);
routes.post("/qrcodes/create", Controller.getQrCode);
routes.post("/qrcodes/end", Controller.invalidate);
routes.post("/fr", Controller.attendByFR);

export default routes;
