import mediaPlayers from "../../fixtures/regexes/client/mediaplayers.json";
import { formatVersion } from "../../utils/version";
import { variableReplacement } from "../../utils/variable-replacement";
import { userAgentParser } from "../../utils/user-agent";
export default class MediaPlayerParser {
    constructor(options) {
        this.options = {
            versionTruncation: 1
        };
        this.parse = (userAgent) => {
            const result = {
                type: "",
                name: "",
                version: ""
            };
            for (const mediaPlayer of mediaPlayers) {
                const match = userAgentParser(mediaPlayer.regex, userAgent);
                if (!match)
                    continue;
                result.type = "media player";
                result.name = variableReplacement(mediaPlayer.name, match);
                result.version = formatVersion(variableReplacement(mediaPlayer.version, match), this.options.versionTruncation);
                break;
            }
            return result;
        };
        this.options = Object.assign(Object.assign({}, this.options), options);
    }
}
