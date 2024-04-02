import server from "bunrest";

const DeviceDetector = require('node-device-detector');
const ClientHints = require('node-device-detector/client-hints');
const DB = require("simple-json-db")

const app = server()
const db = new DB("./db")

let connectedWebSockets = []

app.get("/", (req, res) => {
    res.status(200).send(Bun.file("./index.html"))
})

app.post('/e', async (req, res) => {
    const m = req?.body?.m
    const reMeta = {
        width: m.w || null,
        height: m.h || null,
        ratio: m.r || null,
        ram: m.a || null,
        gpu: m.g || null,
        colorDepth: m.c || null,
        gamut: m.m || null,
        cores: m.e || null
    }

    const data = await new DeviceDetector().detectAsync(req.headers['user-agent'], new ClientHints().parse(Object.assign(req?.headers || {}, req?.body?.h || {}), reMeta))

    const currentData = db.get("data")
    console.log("Current", currentData)

    console.log("New", currentData)
    Object.assign(currentData.os, { [data.os.name]: currentData?.os[data.os.name] + 1 || 1 })
    Object.assign(currentData.client, { [data.client.name]: currentData?.client[data.client.name] + 1 || 1 })
    Object.assign(currentData.device, { [data.device.type]: currentData?.device[data.device.type] + 1 || 1 })


    db.set("data", currentData)

    connectedWebSockets.forEach((ws) => {
        ws.send(JSON.stringify(db.get("data")))
    })

    return res.status(200).json({ status: 200 })
});

app.ws(() => { }, {
    open: (ws) => {
        connectedWebSockets.push(ws)
        ws.send(JSON.stringify(db.get("data") || {}))
    },

    close: (ws) => {
        connectedWebSockets.pop(ws)
    }
})

app.listen(3000, () => {
    console.log('App is listening on port 3000');
});