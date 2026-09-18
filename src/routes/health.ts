import { Router, type IRouter } from "express";
import type { Request, Response } from "express";

const router: IRouter = Router();

function health(_req: Request, res: Response): void {
  res.json({ status: "ok" });
}

router.get("/", health);
router.get("/api", health);
router.get("/api/index", health);
router.get("/api/index.js", health);
router.get("/health", health);
router.get("/api/health", health);
router.get("/healthz", health);
router.get("/api/healthz", health);

export default router;
