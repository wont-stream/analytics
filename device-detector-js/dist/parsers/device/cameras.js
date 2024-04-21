import cameras from "../../fixtures/regexes/device/cameras.json";
import { variableReplacement } from "../../utils/variable-replacement";
import { userAgentParser } from "../../utils/user-agent";
export default class CameraParser {
    constructor() {
        this.parse = (userAgent) => {
            const result = {
                type: "",
                brand: "",
                model: ""
            };
            for (const [brand, camera] of Object.entries(cameras)) {
                const match = userAgentParser(camera.regex, userAgent);
                if (!match)
                    continue;
                result.type = "camera";
                result.brand = brand;
                if ("model" in camera && camera.model) {
                    result.model = variableReplacement(camera.model, match).trim();
                }
                else if ("models" in camera && camera.models) {
                    for (const model of camera.models) {
                        const modelMatch = userAgentParser(model.regex, userAgent);
                        if (!modelMatch)
                            continue;
                        result.model = variableReplacement(model.model, modelMatch).trim();
                        break;
                    }
                }
                break;
            }
            return result;
        };
    }
}
