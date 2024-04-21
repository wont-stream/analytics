import BrowserParser from "./browser";
import MobileAppParser from "./mobile-apps";
import FeedReaderParser from "./feed-readers";
import LibraryParser from "./libraries";
import MediaPlayerParser from "./media-players";
import PersonalInformationManagerParser from "./personal-information-managers";
const clientParsers = [
    FeedReaderParser,
    MobileAppParser,
    MediaPlayerParser,
    PersonalInformationManagerParser,
    BrowserParser,
    LibraryParser
];
export default class ClientParser {
    constructor(options) {
        this.options = {
            versionTruncation: 1
        };
        this.parse = (userAgent) => {
            for (const Parser of clientParsers) {
                const parser = new Parser(this.options);
                const client = parser.parse(userAgent);
                if (client.type !== "")
                    return client;
            }
            return null;
        };
        this.options = Object.assign(Object.assign({}, this.options), options);
    }
}
