import feedReaders from "../../fixtures/regexes/client/feed_readers.json";
import { formatVersion } from "../../utils/version";
import { variableReplacement } from "../../utils/variable-replacement";
import { userAgentParser } from "../../utils/user-agent";
export default class FeedReaderParser {
    constructor(options) {
        this.options = {
            versionTruncation: 1
        };
        this.parse = (userAgent) => {
            const result = {
                type: "",
                name: "",
                version: "",
                url: ""
            };
            for (const feedReader of feedReaders) {
                const match = userAgentParser(feedReader.regex, userAgent);
                if (!match)
                    continue;
                result.type = "feed reader";
                result.name = variableReplacement(feedReader.name, match);
                result.version = formatVersion(variableReplacement(feedReader.version, match), this.options.versionTruncation);
                result.url = feedReader.url;
                break;
            }
            return result;
        };
        this.options = Object.assign(Object.assign({}, this.options), options);
    }
}
