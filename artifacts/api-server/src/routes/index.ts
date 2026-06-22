import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jamendoRouter from "./jamendo";
import ytmusicRouter from "./ytmusic";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jamendoRouter);
router.use(ytmusicRouter);

export default router;
