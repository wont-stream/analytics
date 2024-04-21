declare const _exports: (
  | {
      regex: string;
      name: string;
      version: string;
      versions?: undefined;
    }
  | {
      regex: string;
      name: string;
      versions: {
        regex: string;
        version: string;
      }[];
      version?: undefined;
    }
  | {
      regex: string;
      name: string;
      version: string;
      versions: {
        regex: string;
        version: string;
      }[];
    }
)[];
export = _exports;
