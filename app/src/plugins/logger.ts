import Elysia from "elysia";
import logixlysia from "logixlysia";

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const formattedDate = `${year}-${month}-${day}`;

export const loggerPlugin = new Elysia({
  name: "Elysia with Logixlysia",
}).use(
  logixlysia({
    config: {
      showStartupMessage: true,
      startupMessageFormat: "simple",
      timestamp: {
        translateTime: "yyyy-mm-dd HH:MM:ss.SSS",
      },
      logFilePath: `./logs/${formattedDate}.log`,
      ip: true,
      customLogFormat:
        "🦊 {now} {level} {duration} {method} {pathname} {status} {message} {ip}",
    },
  })
);
