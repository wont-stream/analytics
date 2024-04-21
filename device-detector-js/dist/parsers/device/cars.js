import cars from "../../fixtures/regexes/device/car_browsers.json";
import { variableReplacement } from "../../utils/variable-replacement";
import { userAgentParser } from "../../utils/user-agent";
export default class CarParser {
  constructor() {
    this.parse = (userAgent) => {
      const result = {
        type: "",
        brand: "",
        model: "",
      };
      for (const [brand, car] of Object.entries(cars)) {
        const match = userAgentParser(car.regex, userAgent);
        if (!match) continue;
        result.type = "car";
        result.brand = brand;
        for (const model of car.models) {
          const match = userAgentParser(model.regex, userAgent);
          if (!match) continue;
          result.model = variableReplacement(model.model, match).trim();
        }
        break;
      }
      return result;
    };
  }
}
