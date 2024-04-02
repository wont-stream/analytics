const { unlink } = require("node:fs/promises");

const path = __dirname + "/ipdb.json";

const getDB = async () => {
  const ipv4 = await (
    await fetch(
      "https://cdn.jsdelivr.net/gh/sapics/ip-location-db@main/iptoasn-country/iptoasn-country-ipv4.csv"
    )
  ).text();

  const ipv6 = await (
    await fetch(
      "https://cdn.jsdelivr.net/gh/sapics/ip-location-db@main/iptoasn-country/iptoasn-country-ipv6.csv"
    )
  ).text();

  return `${ipv4}${ipv6}`;
};

const parseDB = async (db) => {
  return new Promise((resolve, reject) => {
    try {
      const arr = [];
      const lines = db.split("\n");
      lines.forEach((entry) => {
        arr.push(entry);
      });
      resolve(arr);
    } catch (error) {
      reject(error);
    }
  });
};

const saveDB = async () => {
  let db = await getDB();
  db = await parseDB(db);

  try {
    await unlink(path);
  } catch (_) {}

  const file = Bun.file(path);

  Bun.write(file, JSON.stringify(db.filter((_) => _)));

  console.log("Updated IP Datebase");
};

const getIP = async (ipAddress) => {
  const database = await Bun.file(path, { type: "application/json" }).json();

  for (var i = 0; i < database.length; i++) {
    // Split the entry by comma to get individual components
    var components = database[i].split(",");

    // Extract the IP range start and end
    var ipRangeStart = components[0];
    var ipRangeEnd = components[1];

    // Check if the IP address falls within the range
    if (ipAddress >= ipRangeStart && ipAddress <= ipRangeEnd) {
      // Return the country code if the IP address is within the range
      return components[2];
    }
  }
  // Return null if no matching entry is found
  return null;
};

export default { saveDB, getIP };
