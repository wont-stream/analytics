const { unlink } = require("node:fs/promises");

const path = __dirname + "/refdb.json";

const getDB = async () => {
  return await (
    await fetch(
      "https://s3-eu-west-1.amazonaws.com/snowplow-hosted-assets/third-party/referer-parser/referers-latest.json"
    )
  ).text();
};

const saveDB = async () => {
  let db = await getDB();

  try {
    await unlink(path);
  } catch (_) {}

  const file = Bun.file(path);

  Bun.write(file, JSON.stringify(db));

  console.log("Updated referer Datebase");
};

const getRef = async (referer) => {
  const database = await Bun.file(path, { type: "application/json" }).json();

  for (let cat of Object.keys(database)) {
    for (let comp of Object.keys(database[cat])) {
        if (database[cat][comp].domains.includes(referer)) {
            return comp;
        }
    }
}
return null; // Return null if no component is found with the specified domain
};

export default { saveDB, getRef };
