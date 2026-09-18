import { Router, type IRouter } from "express";
import type { Request, Response } from "express";
import { optimizeEnergy } from "../gridwise/service";
import { GridWiseError } from "../gridwise/types";

const router: IRouter = Router();

async function handleOptimize(req: Request, res: Response): Promise<void> {
  try {
    const response = await optimizeEnergy(req.body);
    res.status(200).json(response);
  } catch (error) {
    if (error instanceof GridWiseError) {
      res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
      });
      return;
    }
    req.log.error({ err: error }, "Unhandled optimization error");
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "The optimization request could not be completed.",
      },
    });
  }
}

router.post("/", handleOptimize);
router.post("/api", handleOptimize);
router.post("/optimize-energy", handleOptimize);
router.post("/api/optimize-energy", handleOptimize);

export default router;