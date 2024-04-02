const g = "webgl",
  w = window,
  n = w.navigator,
  j = JSON,
  js = j.stringify,
  r = w.devicePixelRatio,
  s = w.screen,
  l = (() => {
    var e = document.createElement("canvas"),
      e = e.getContext.bind(e);
    return e(g) || e("experimental-" + g);
  })();
(async () => {
  try {
    return j.parse(
      js(
        await n.userAgentData.getHighEntropyValues([
          "brands",
          "mobile",
          "platform",
          "platformVersion",
          "architecture",
          "bitness",
          "wow64",
          "model",
          "uaFullVersion",
          "fullVersionList",
        ])
      )
    );
  } catch (e) {
    return {};
  }
})().then((e) => {
  w.fetch("/e", {
    method: "POST",
    body: js({
      m: {
        w: s.width * r,
        h: s.height * r,
        r: r,
        a: n.deviceMemory,
        g: l
          ? l.getParameter(
              l.getExtension("WEBGL_debug_renderer_info")
                .UNMASKED_RENDERER_WEBGL
            )
          : u,
        c: w.screen.colorDepth,
        m: ["p3", "srgb", "rec2020"].find(
          (e) => w.matchMedia(`(color-gamut: ${e})`).matches
        ),
        e: n.hardwareConcurrency,
      },
      h: e,
    }),
  });
});
