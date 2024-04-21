export const trim = (str, char) => {
    return str.replace(new RegExp("^[" + char + "]+|[" + char + "]+$", "g"), "");
};
