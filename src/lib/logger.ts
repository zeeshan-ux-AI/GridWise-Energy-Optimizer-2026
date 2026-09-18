interface LogEntry {
  level: number;
  time: number;
  pid: number;
  msg?: string;
  [key: string]: any;
}

function writeLog(stream: NodeJS.WriteStream, level: number, objOrMsg: any, msg?: string): void {
  const entry: LogEntry = {
    level,
    time: Date.now(),
    pid: process.pid,
  };

  if (typeof objOrMsg === "string") {
    entry.msg = objOrMsg;
  } else if (objOrMsg instanceof Error) {
    entry.err = {
      type: objOrMsg.name,
      message: objOrMsg.message,
      stack: objOrMsg.stack,
    };
    if (msg) entry.msg = msg;
  } else if (typeof objOrMsg === "object" && objOrMsg !== null) {
    Object.assign(entry, objOrMsg);
    if (msg) entry.msg = msg;
  } else if (msg) {
    entry.msg = msg;
  }

  stream.write(JSON.stringify(entry) + "\n");
}

export const logger = {
  info: (objOrMsg: any, msg?: string) => writeLog(process.stdout, 30, objOrMsg, msg),
  warn: (objOrMsg: any, msg?: string) => writeLog(process.stdout, 40, objOrMsg, msg),
  error: (objOrMsg: any, msg?: string) => writeLog(process.stderr, 50, objOrMsg, msg),
  debug: (objOrMsg: any, msg?: string) => {
    if (process.env.LOG_LEVEL === "debug") {
      writeLog(process.stdout, 20, objOrMsg, msg);
    }
  },
};

export type Logger = typeof logger;
