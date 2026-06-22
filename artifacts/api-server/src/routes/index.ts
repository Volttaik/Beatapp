import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jamendoRouter from "./jamendo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jamendoRouter);

export default router;
