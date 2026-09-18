import { Router, type IRouter } from "express";
import healthRouter from "./health";
import optimizeRouter from "./optimize-energy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(optimizeRouter);

export default router;
