import personalInformationManagers from "../../fixtures/regexes/client/pim.json";
import { formatVersion } from "../../utils/version";
import { variableReplacement } from "../../utils/variable-replacement";
import { userAgentParser } from "../../utils/user-agent";
export default class PersonalInformationManagerParser {
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
      for (const personalInformationManager of personalInformationManagers) {
        const match = userAgentParser(
          personalInformationManager.regex,
          userAgent
        );
        if (!match) continue;
        result.type = "personal information manager";
        result.name = variableReplacement(
          personalInformationManager.name,
          match
        );
        result.version = formatVersion(
          variableReplacement(personalInformationManager.version, match),
          this.options.versionTruncation
        );
        break;
      }
      return result;
    };
    this.options = Object.assign(Object.assign({}, this.options), options);
  }
}
