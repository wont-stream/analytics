const g = "webgl"
const w = window
const n = w.navigator
const j = JSON
const js = j.stringify
const r = w.devicePixelRatio
const s = w.screen

const l = (() => {
    const c = document.createElement('canvas')
    const o = c.getContext.bind(c);
    return o(g) || o(`experimental-${g}`);
})();

(async () => {
    try {
        return j.parse(js(await n.userAgentData.getHighEntropyValues(['brands', 'mobile', 'platform', 'platformVersion', 'architecture', 'bitness', 'wow64', 'model', 'uaFullVersion', 'fullVersionList'])));
    } catch (e) {
        return {};
    }
})().then(h => {
    w.fetch("/e", {
        method: "POST",
        body: js({
            m: {
                w: s.width * r,
                h: s.height * r,
                r: r,
                a: n.deviceMemory,
                g: l ? l.getParameter(l.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL) : u,
                c: w.screen.colorDepth,
                m: ["p3", "srgb", "rec2020"].find(c => w.matchMedia(`(color-gamut: ${c})`).matches),
                e: n.hardwareConcurrency
            },
            h
        }),
    });
})