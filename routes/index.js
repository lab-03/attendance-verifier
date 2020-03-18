import { Router } from "express";
import Controller from "../controllers/controller";
const routes = Router();

routes.get("/", Controller.getAllQrCodes);
routes.post("/attend", Controller.attend);
routes.post("/create", Controller.getQrCode);

export default routes;
