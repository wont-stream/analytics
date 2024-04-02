module.exports = () => {
  const app = {
    routes: {
      GET: {},
      HEAD: {},
      POST: {},
      PUT: {},
      DELETE: {},
      CONNECT: {},
      OPTIONS: {},
      TRACE: {},
      PATCH: {},
      ws: {
        message: {},
        open: {},
        close: {},
        drain: {},
      },
    },

    get: async (pathName, func) => {
      app.routes.GET[pathName] = await func;
    },

    head: async (pathName, func) => {
      app.routes.HEAD[pathName] = await func;
    },

    post: async (pathName, func) => {
      app.routes.POST[pathName] = await func;
    },

    put: async (pathName, func) => {
      app.routes.PUT[pathName] = await func;
    },

    delete: async (pathName, func) => {
      app.routes.DELETE[pathName] = await func;
    },

    connect: async (pathName, func) => {
      app.routes.CONNECT[pathName] = await func;
    },

    options: async (pathName, func) => {
      app.routes.OPTIONS[pathName] = await func;
    },

    trace: async (pathName, func) => {
      app.routes.TRACE[pathName] = await func;
    },

    patch: async (pathName, func) => {
      app.routes.PATCH[pathName] = await func;
    },

    ws: {
      message: async (pathName, func) => {
        app.routes.ws.message[pathName] = await func;
      },

      open: async (pathName, func) => {
        app.routes.ws.open[pathName] = await func;
      },

      close: async (pathName, func) => {
        app.routes.ws.close[pathName] = await func;
      },

      drain: async (pathName, func) => {
        app.routes.ws.drain[pathName] = await func;
      },
    },
  };

  const server = Bun.serve({
    async fetch(req, server) {
      const { method, url } = req;
      const path = new URL(url).pathname;

      if (server.upgrade(req, { data: { path, createdAt: Date.now() } }))
        return undefined;

      if (app.routes[method][path])
        return app.routes[method][path](req, server);

      return new Response("Route not found");
    },
    websocket: {
      async message(ws, message) {
        if (app.routes.ws.message[ws.data.path])
          return app.routes.ws.message[ws.data.path](ws, message);
      },

      async open(ws) {
        if (app.routes.ws.open[ws.data.path])
          return app.routes.ws.open[ws.data.path](ws);
      },

      async close(ws, code, message) {
        if (app.routes.ws.close[ws.data.path])
          return app.routes.ws.close[ws.data.path](ws, code, message);
      },

      async drain(ws) {
        if (app.routes.ws.drain[ws.data.path])
          return app.routes.ws.drain[ws.data.path](ws);
      },
    },
  });

  return Object.assign(app, { server });
};
