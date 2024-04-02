import { Server, WebSocketHandler } from "bun";
import { BunResponse } from "./response";
import {
  RequestMethod,
  Handler,
  Middleware,
  BunRequest,
  SSLOptions,
  RequestMapper,
  RequestMethodType,
} from "./request";
import { ExtraHandler, RestSocketHandler } from "./websocket";
import { Router } from "../router/router";
import { Chain } from "../utils/chain";
import { TrieTree } from "./trie-tree";
// import { encodeBase64 } from "../utils/base64";

export function server() {
  return BunServer.instance;
}

class BunServer implements RequestMethod {
  // singleton bun server
  private static server?: BunServer;

  constructor() {
    if (BunServer.server) {
      throw new Error(
        "DONT use this constructor to create bun server, try Server()"
      );
    }
    BunServer.server = this;
  }

  static get instance() {
    return BunServer.server ?? (BunServer.server = new BunServer());
  }

  private readonly requestMap: RequestMapper = {};
  private readonly middlewares: Middleware[] = [];
  private readonly errorHandlers: Handler[] = [];
  private webSocketHandler: WebSocketHandler | undefined;

  get(path: string, ...handlers: Handler[]) {
    this.delegate(path, "GET", handlers);
  }

  put(path: string, ...handlers: Handler[]) {
    this.delegate(path, "PUT", handlers);
  }

  post(path: string, ...handlers: Handler[]) {
    this.delegate(path, "POST", handlers);
  }

  patch(path: string, ...handlers: Handler[]) {
    this.delegate(path, "PATCH", handlers);
  }

  delete(path: string, ...handlers: Handler[]) {
    this.delegate(path, "DELETE", handlers);
  }

  options(path: string, ...handlers: Handler[]) {
    this.delegate(path, "OPTIONS", handlers);
  }

  head(path: string, ...handlers: Handler[]) {
    this.delegate(path, "HEAD", handlers);
  }

  /**
   * websocket interface
   */
  ws(msgHandler: RestSocketHandler, extra: ExtraHandler = null) {
    this.webSocketHandler = {
      message: msgHandler,
      open: extra?.open,
      close: extra?.close,
      drain: extra?.drain,
    };
  }

  /**
   * Add middleware
   * @param middleware
   */
  use(middleware: Handler): void;

  /**
   * Attach router
   * @param path
   * @param router
   */
  use(path: string, router: Router): void;

  /**
   * Attch middleware or router or global error handler
   * @param arg1
   * @param arg2
   */
  use(arg1: string | Handler, arg2?: Router) {
    // pass router
    if (arg2 && typeof arg1 === "string") {
      arg2.attach(arg1);
    }
    // pass middleware or global error handler
    else {
      if (arg1.length === 3) {
        this.middlewares.push(arg1 as Handler);
      } else if (arg1.length === 4) {
        this.errorHandlers.push(arg1 as Handler);
      }
    }
  }

  router() {
    return new Router(this.requestMap, this.middlewares, this.submitToMap);
  }

  listen(
    port: string | number,
    callback?: () => void,
    options?: SSLOptions
  ): Server {
    const baseUrl = "http://localhost:" + port;
    callback?.call(null);
    return this.openServer(port, baseUrl, options);
  }

  private openServer(
    port: string | number,
    baseUrl: string,
    options?: SSLOptions
  ): Server {
    const that = this;
    return Bun.serve({
      port,
      reusePort: options?.reusePort,
      keyFile: options?.keyFile,
      certFile: options?.certFile,
      passphrase: options?.passphrase,
      caFile: options?.caFile,
      dhParamsFile: options?.dhParamsFile,
      lowMemoryMode: options?.lowMemoryMode,
      development: process.env.SERVER_ENV !== "production",
      async fetch(req1: Request, server: any) {
        server.upgrade(req1);

        const req: BunRequest = await that.bunRequest(req1);
        const res = that.responseProxy();

        if (req.path.endsWith("/")) {
          req.path = req.path.slice(0, req.path.length);
        }

        const tree: TrieTree<string, Handler> =
          that.requestMap[req.method.toLowerCase()];

        if (!tree) {
          throw new Error(`There is no path matches ${req.method}`);
        }

        const leaf = tree.get(req.path);

        // fix (issue 4: unhandle route did not throw an error)
        if (!leaf.node) {
          console.error(`Cannot ${req.method} ${req.path}`);
          res.status(404).send(`${req.method} ${req.path} with a 404`);
          return res.getResponse();
        }

        // append req route params
        req.params = leaf.routeParams;

        // middlewares handler
        if (that.middlewares.length !== 0) {
          const chain = new Chain(req, res, that.middlewares);
          await chain.run();

          if (res.isReady()) {
            return res.getResponse();
          }

          if (!chain.isFinish()) {
            throw new Error("Please call next() at the end of your middleware");
          }
        }

        const handler: Handler[] = leaf.node?.getHandler();
        const middlewares: Handler[] = leaf.node?.getMiddlewares();

        const chain = new Chain(req, res, middlewares);
        await chain.run();

        if (res.isReady()) {
          return res.getResponse();
        }

        if (!chain.isFinish()) {
          throw new Error("Please call next() at the end of your middleware");
        }

        // fix (issue 13) : How to make it work with async functions or Promises?
        // fix where response data cannot be processed in promise block
        const response = handler.apply(that, [req, res]);
        if (response instanceof Promise) {
          await response;
        }

        return res.getResponse();
      },
      websocket: this.webSocketHandler,
      error(err: Error) {
        const res = that.responseProxy();
        // basically, next here is to ignore the error
        const next = () => {};
        that.errorHandlers.forEach((handler) => {
          // * no request object pass to error handler
          handler.apply(that, [null, res, err, next]);
        });

        if (res.isReady()) {
          return res.getResponse();
        }
      },
    });
  }

  private async bunRequest(req: Request): Promise<BunRequest> {
    const { searchParams, pathname } = new URL(req.url);
    const newReq: BunRequest = {
      method: req.method,
      path: pathname,
      request: req,
      query: {},
      params: {},
      headers: {},
      originalUrl: req.url,
    };

    // append query params
    searchParams.forEach((v, k) => {
      newReq.query[k] = v;
    });

    // receive request body as string
    const bodyStr = await req.text();
    try {
      newReq.body = JSON.parse(bodyStr);
    } catch (err) {
      newReq.body = bodyStr;
    }
    req.arrayBuffer;
    newReq.blob = req.blob();

    // append headers
    req.headers.forEach((v, k) => {
      newReq.headers[k] = v;
    });

    return newReq;
  }

  private responseProxy(): BunResponse {
    const bunResponse = new BunResponse();
    return new Proxy(bunResponse, {
      get(target, prop, receiver) {
        if (
          typeof target[prop] === "function" &&
          (prop === "json" || prop === "send") &&
          target.isReady()
        ) {
          throw new Error("You cannot send response twice");
        } else {
          return Reflect.get(target, prop, receiver);
        }
      },
    });
  }

  private delegate(
    path: string,
    method: RequestMethodType,
    handlers: Handler[]
  ) {
    let key = path;

    if (key === "/") {
      key = "";
    }

    if (handlers.length < 1) return;
    // Split the array
    const middlewares = handlers.slice(0, -1);
    const handler = handlers[handlers.length - 1];

    this.submitToMap(method.toLowerCase(), path, handler, middlewares);
  }

  private submitToMap(
    method: string,
    path: string,
    handler: Handler,
    middlewares: Middleware
  ) {
    let targetTree: TrieTree<string, Handler> = this.requestMap[method];
    if (!targetTree) {
      this.requestMap[method] = new TrieTree();
      targetTree = this.requestMap[method];
    }
    const route = {
      handler: handler,
      middlewareFuncs: middlewares,
    };
    targetTree.insert(path, route);
  }
}
