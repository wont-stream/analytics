import { memoryCache } from "./memory-cache";
const cache = memoryCache();
const getRegexInstance = (rawRegex) => {
    const cachedRegexInstance = cache.get(rawRegex);
    if (cachedRegexInstance)
        return cachedRegexInstance.value;
    const regexInstance = RegExp(`(?:^|[^A-Z0-9\-_]|[^A-Z0-9\-]_|sprd-)(?:${rawRegex})`, "i");
    cache.set(rawRegex, {
        value: regexInstance
    });
    return regexInstance;
};
export const userAgentParser = (rawRegex, userAgent) => {
    // TODO: find out why it fails in some browsers
    try {
        const regexInstance = getRegexInstance(rawRegex);
        const match = regexInstance.exec(userAgent);
        return match ? match.slice(1) : null;
    }
    catch (_a) {
        return null;
    }
};
