import server from "./server.js";
import country from "./country.js";
import ref from "./ref.js";
import DeviceDetector from "./device-detector-js"

const DB = require("simple-json-db");

const app = server();
const db = new DB("./db.json");

let connectedWebSockets = new Set();

app.get("/", async () => {
  return new Response(await Bun.file(__dirname + "/index.html").text(), {
    headers: {
      "content-type": "text/html",
    },
  });
});

app.post("/e", async (req, server) => {
  const ip =
    req.headers["CF-Connecting-IP"] ||
    req.headers["X-Forwarded-For"] ||
    server.requestIP(req);

  const data = new DeviceDetector().parse(req.headers["user-agent"] || "")

  if (data.bot !== null) {
    return new Response(
      { status: 304 },
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }

  const visitorCountry = (await country.getIP(ip)) || "Unknown";

  const visitorReferer = ref.getRef(await req.text() || "") || "Unknown";

  const currentData = db.get("data") || {
    os: {},
    client: {},
    device: {},
    country: {},
    ref: {}
  };

  Object.assign(currentData?.os, {
    [data.os.name]: currentData?.os[data.os.name] + 1 || 1,
  });
  Object.assign(currentData?.client, {
    [data.client.name]: currentData?.client[data.client.name] + 1 || 1,
  });
  Object.assign(currentData?.device, {
    [data.device.type]: currentData?.device[data.device.type] + 1 || 1,
  });
  Object.assign(currentData?.country, {
    [visitorCountry]: currentData?.country[visitorCountry] + 1 || 1,
  });
  Object.assign(currentData?.ref, {
    [visitorReferer]: currentData?.ref[visitorReferer] + 1 || 1,
  });

  connectedWebSockets.forEach((ws) => {
    ws.send(JSON.stringify(currentData));
  });

  db.set("data", currentData);

  return new Response(
    { status: 202 },
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
});

app.ws.open("/", (ws) => {
  connectedWebSockets.add(ws);
  ws.send(JSON.stringify(db.get("data") || {}));
});

app.ws.close("/", (ws) => {
  connectedWebSockets.delete(ws);
});

function runOnceADay(callback, hour, minute, second) {
  // Calculate the time until the next desired run
  const now = new Date();
  const offset = -5 * 60 * 60 * 1000; // Eastern Standard Time (EST) offset is -5 hours from UTC
  const nowEST = new Date(now.getTime() + offset);
  let timeUntilNextRun = new Date(nowEST);
  timeUntilNextRun.setHours(hour, minute, second, 0); // Set the time for the next run
  if (timeUntilNextRun <= nowEST) {
    // If the calculated time has already passed for today, set it for tomorrow
    timeUntilNextRun.setDate(timeUntilNextRun.getDate() + 1);
  }
  timeUntilNextRun = timeUntilNextRun - nowEST; // Calculate the time until the next run in milliseconds

  // Set a timeout to run the callback function
  setTimeout(() => {
    callback();
    // Set the interval to run again after 24 hours
    setInterval(callback, 24 * 60 * 60 * 1000);
  }, timeUntilNextRun);
}

// Example usage: Run a function once a day at 1:00:00 AM EST
runOnceADay(country.saveDB, 1, 0, 0);

country.saveDB();

runOnceADay(ref.saveDB, 1, 0, 0);

ref.saveDB();
