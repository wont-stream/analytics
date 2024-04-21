import mobileApps from "../../fixtures/regexes/client/mobile_apps.json";
import { formatVersion } from "../../utils/version";
import { variableReplacement } from "../../utils/variable-replacement";
import { userAgentParser } from "../../utils/user-agent";
export default class MobileAppParser {
  constructor(options) {
    this.options = {
      versionTruncation: 1,
    };
    this.parse = (userAgent) => {
      const result = {
        type: "",
        name: "",
        version: "",
      };
      for (const mobileApp of mobileApps) {
        const match = userAgentParser(mobileApp.regex, userAgent);
        if (!match) continue;
        result.type = "mobile app";
        result.name = variableReplacement(mobileApp.name, match);
        result.version = formatVersion(
          variableReplacement(mobileApp.version, match),
          this.options.versionTruncation
        );
        break;
      }
      return result;
    };
    this.options = Object.assign(Object.assign({}, this.options), options);
  }
}
