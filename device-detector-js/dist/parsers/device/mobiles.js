import mobiles from "../../fixtures/regexes/device/mobiles.json";
import { variableReplacement } from "../../utils/variable-replacement";
import { userAgentParser } from "../../utils/user-agent";
import { buildModel } from "../../utils/model";
export default class MobileParser {
  constructor() {
    this.parse = (userAgent) => {
      const result = {
        type: "",
        brand: "",
        model: "",
      };
      let resultType = "";
      for (const [brand, mobile] of Object.entries(mobiles)) {
        const match = userAgentParser(mobile.regex, userAgent);
        if (!match) continue;
        resultType = ("device" in mobile && mobile.device) || "";
        result.brand = brand;
        if ("model" in mobile && mobile.model) {
          result.model = buildModel(
            variableReplacement(mobile.model, match)
          ).trim();
        } else if ("models" in mobile && mobile.models) {
          for (const model of mobile.models) {
            const modelMatch = userAgentParser(model.regex, userAgent);
            if (!modelMatch) continue;
            result.model = buildModel(
              variableReplacement(model.model, modelMatch)
            ).trim();
            if ("device" in model && model.device) {
              resultType = model.device;
            }
            if ("brand" in model) {
              result.brand = model.brand || "";
            }
            break;
          }
        }
        break;
      }
      // Sanitize device type
      if (resultType === "tv") {
        result.type = "television";
      } else if (resultType === "car browser") {
        result.type = "car";
      } else {
        result.type = resultType;
      }
      // Sanitize device brand
      if (result.brand === "Unknown") {
        result.brand = "";
      }
      return result;
    };
  }
}
