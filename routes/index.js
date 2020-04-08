import { Router } from "express";
import Controller from "../controllers/controller";
const routes = Router();

routes.get("/qrcodes/", Controller.getAllQrCodes);
routes.post("/qrcodes/attend", Controller.attend);
routes.post("/qrcodes/create", Controller.getQrCode);
routes.post("/fr",Controller.attendByFR);

export default routes;
