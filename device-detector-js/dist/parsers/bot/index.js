import bots from "../../fixtures/regexes/bots.json";
import { userAgentParser } from "../../utils/user-agent";
class BotParser {
  constructor() {
    this.parse = (userAgent) => {
      var _a, _b, _c, _d;
      for (const bot of bots) {
        const match = userAgentParser(bot.regex, userAgent);
        if (!match) continue;
        return {
          name: bot.name,
          category: bot.category || "",
          url: bot.url || "",
          producer: {
            name:
              ((_b =
                (_a = bot) === null || _a === void 0 ? void 0 : _a.producer) ===
                null || _b === void 0
                ? void 0
                : _b.name) || "",
            url:
              ((_d =
                (_c = bot) === null || _c === void 0 ? void 0 : _c.producer) ===
                null || _d === void 0
                ? void 0
                : _d.url) || "",
          },
        };
      }
      return null;
    };
  }
}
export default BotParser;
