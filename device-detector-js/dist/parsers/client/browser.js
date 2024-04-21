import { formatVersion, parseBrowserEngineVersion } from "../../utils/version";
import { variableReplacement } from "../../utils/variable-replacement";
import { userAgentParser } from "../../utils/user-agent";
import browsers from "../../fixtures/regexes/client/browsers.json";
import browserEngines from "../../fixtures/regexes/client/browser_engine.json";
import availableBrowsers from "./fixtures/available-browsers.json";
import mobileOnlyBrowsers from "./fixtures/mobile-only-browsers.json";
export default class BrowserParser {
    constructor(options) {
        this.options = {
            versionTruncation: 1
        };
        this.parse = (userAgent) => {
            const result = {
                type: "",
                name: "",
                version: "",
                engine: "",
                engineVersion: ""
            };
            for (const browser of browsers) {
                const match = userAgentParser(browser.regex, userAgent);
                if (!match)
                    continue;
                const vrpVersion = variableReplacement(browser.version, match);
                const version = formatVersion(vrpVersion, this.options.versionTruncation);
                const shortVersion = version && parseFloat(formatVersion(vrpVersion, 1)) || "";
                if (browser.engine) {
                    result.engine = browser.engine.default;
                    if (browser.engine && browser.engine.versions && shortVersion) {
                        const sortedEngineVersions = Object.entries(browser.engine.versions).sort((a, b) => {
                            return parseFloat(a[0]) > parseFloat(b[0]) ? 1 : -1;
                        });
                        for (const [versionThreshold, engineByVersion] of sortedEngineVersions) {
                            if (parseFloat(versionThreshold) <= shortVersion) {
                                result.engine = engineByVersion || "";
                            }
                        }
                    }
                }
                result.type = "browser";
                result.name = variableReplacement(browser.name, match);
                result.version = version;
                break;
            }
            if (!result.engine) {
                for (const browserEngine of browserEngines) {
                    let match = null;
                    try {
                        match = RegExp(browserEngine.regex, "i").exec(userAgent);
                    }
                    catch (_a) {
                        // TODO: find out why it fails in some browsers
                    }
                    if (!match)
                        continue;
                    result.engine = browserEngine.name;
                    break;
                }
            }
            result.engineVersion = formatVersion(parseBrowserEngineVersion(userAgent, result.engine), this.options.versionTruncation);
            return result;
        };
        this.options = Object.assign(Object.assign({}, this.options), options);
    }
}
BrowserParser.getBrowserShortName = (browserName) => {
    for (const [shortName, name] of Object.entries(availableBrowsers)) {
        if (name === browserName) {
            return shortName;
        }
    }
    return "";
};
BrowserParser.isMobileOnlyBrowser = (browserName) => {
    return mobileOnlyBrowsers.includes(BrowserParser.getBrowserShortName(browserName));
};
