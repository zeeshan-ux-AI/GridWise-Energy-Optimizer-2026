import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import router from "./routes";
import { logger } from "./lib/logger";

declare global {
  namespace Express {
    interface Request {
      log: typeof logger;
    }
  }
}

const app: Express = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  req.log = logger;
  const start = Date.now();
  res.on("finish", () => {
    logger.info(
      {
        req: {
          method: req.method,
          url: req.url?.split("?")[0],
        },
        res: {
          statusCode: res.statusCode,
        },
        responseTime: Date.now() - start,
      },
      "request completed",
    );
  });
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body must contain valid JSON.",
      },
    });
    return;
  }
  next(error);
});

export default app;
