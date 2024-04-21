import libraries from "../../fixtures/regexes/client/libraries.json";
import { formatVersion } from "../../utils/version";
import { variableReplacement } from "../../utils/variable-replacement";
import { userAgentParser } from "../../utils/user-agent";
export default class LibraryParser {
  constructor(options) {
    this.options = {
      versionTruncation: 1,
    };
    this.parse = (userAgent) => {
      const result = {
        type: "",
        name: "",
        version: "",
        url: "",
      };
      for (const library of libraries) {
        const match = userAgentParser(library.regex, userAgent);
        if (!match) continue;
        result.type = "library";
        result.name = variableReplacement(library.name, match);
        result.version = formatVersion(
          variableReplacement(library.version, match),
          this.options.versionTruncation
        );
        result.url = library.url || "";
        break;
      }
      return result;
    };
    this.options = Object.assign(Object.assign({}, this.options), options);
  }
}
