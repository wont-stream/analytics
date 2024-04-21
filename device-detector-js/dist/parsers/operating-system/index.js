import operatingSystems from "../../fixtures/regexes/oss.json";
import { formatVersion } from "../../utils/version";
import { variableReplacement } from "../../utils/variable-replacement";
import { userAgentParser } from "../../utils/user-agent";
import operatingSystem from "./fixtures/operating-system.json";
const desktopOsArray = ["AmigaOS", "IBM", "GNU/Linux", "Mac", "Unix", "Windows", "BeOS", "Chrome OS"];
const shortOsNames = operatingSystem.operatingSystem;
const osFamilies = operatingSystem.osFamilies;
export default class OperatingSystemParser {
    constructor(options) {
        this.options = {
            versionTruncation: 1
        };
        this.parse = (userAgent) => {
            const result = {
                name: "",
                version: "",
                platform: this.parsePlatform(userAgent)
            };
            for (const operatingSystem of operatingSystems) {
                const match = userAgentParser(operatingSystem.regex, userAgent);
                if (!match)
                    continue;
                result.name = variableReplacement(operatingSystem.name, match);
                result.version = formatVersion(variableReplacement(operatingSystem.version, match), this.options.versionTruncation);
                if (result.name === "lubuntu") {
                    result.name = "Lubuntu";
                }
                if (result.name === "debian") {
                    result.name = "Debian";
                }
                if (result.name === "YunOS") {
                    result.name = "YunOs";
                }
                return result;
            }
            return null;
        };
        this.parsePlatform = (userAgent) => {
            if (userAgentParser("arm|aarch64|Watch ?OS|Watch1,[12]", userAgent)) {
                return "ARM";
            }
            if (userAgentParser("mips", userAgent)) {
                return "MIPS";
            }
            if (userAgentParser("sh4", userAgent)) {
                return "SuperH";
            }
            if (userAgentParser("WOW64|x64|win64|amd64|x86_?64", userAgent)) {
                return "x64";
            }
            if (userAgentParser("(?:i[0-9]|x)86|i86pc", userAgent)) {
                return "x86";
            }
            return "";
        };
        this.options = Object.assign(Object.assign({}, this.options), options);
    }
}
OperatingSystemParser.getDesktopOsArray = () => desktopOsArray;
OperatingSystemParser.getOsFamily = (osName) => {
    const osShortName = OperatingSystemParser.getOsShortName(osName);
    for (const [osFamily, shortNames] of Object.entries(osFamilies)) {
        if (shortNames.includes(osShortName)) {
            return osFamily;
        }
    }
    return "";
};
OperatingSystemParser.getOsShortName = (osName) => {
    for (const [shortName, name] of Object.entries(shortOsNames)) {
        if (name === osName)
            return shortName;
    }
    return "";
};
