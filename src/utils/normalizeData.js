/**
 * Data Normalization Utility for Bangladesh Emergency Locations
 * Unifies Army Camps, Police Thanas, and Highway Police Stations into a single schema.
 */

/**
 * Standard Normalized Location Schema:
 * {
 *   id: string,                 // Unique identifier e.g. "army-0", "thana-12", "highway-5"
 *   type: string,               // "army" | "thana" | "highway"
 *   categoryName: string,       // "সেনা ক্যাম্প" | "পুলিশ থানা" | "হাইওয়ে থানা"
 *   name: string,               // Formatted Bengali name
 *   division: string,           // Administrative division (e.g. "ঢাকা", "চট্টগ্রাম")
 *   lat: number,                // Valid latitude number
 *   lng: number,                // Valid longitude number
 *   contacts: string[],         // Flat array of dialable phone numbers
 *   contactRoles: Array<{       // Role-annotated contact list
 *     role: string,             // e.g. "হটলাইন ১", "ওসি", "ডিউটি অফিসার", "তদন্ত কর্মকর্তা"
 *     number: string
 *   }>,
 *   points?: string[]           // Highway patrol points (if applicable)
 * }
 */

/**
 * Normalizes Bangladesh Army Camps dataset
 * Input source: public/armyCampData.json
 */
export function normalizeArmyCamps(data) {
  const list = Array.isArray(data) ? data : [];
  return list
    .filter((item) => item && !isNaN(Number(item.lat)) && !isNaN(Number(item.lng)))
    .map((item, idx) => {
      const contacts = Array.isArray(item.contacts) ? item.contacts.map(String) : [];
      const cleanName = item.name.includes("ক্যাম্প")
        ? item.name.trim()
        : `${item.name.trim()} সেনা ক্যাম্প`;

      return {
        id: `army-${idx}`,
        type: "army",
        categoryName: "সেনা ক্যাম্প",
        name: cleanName,
        division: item.division || "",
        lat: Number(item.lat),
        lng: Number(item.lng),
        contacts,
        contactRoles: contacts.map((num, i) => ({
          role: `হটলাইন ${i + 1}`,
          number: num,
        })),
      };
    });
}

/**
 * Normalizes Regular Police Thanas dataset
 * Input source: public/BDbdthanasData.json
 */
export function normalizePoliceThanas(data) {
  const list = Array.isArray(data) ? data : [];
  return list
    .filter(
      (item) =>
        item &&
        !isNaN(Number(item.latitude)) &&
        !isNaN(Number(item.longitude))
    )
    .map((item, idx) => {
      const oc = item.oc_mobile ? String(item.oc_mobile).trim() : null;
      const duty = item.duty_officer_mobile
        ? String(item.duty_officer_mobile).trim()
        : null;
      const inspector = item.inspector_mobile
        ? String(item.inspector_mobile).trim()
        : null;

      const contactRoles = [];
      if (oc) contactRoles.push({ role: "ওসি", number: oc });
      if (duty) contactRoles.push({ role: "ডিউটি অফিসার", number: duty });
      if (inspector)
        contactRoles.push({ role: "তদন্ত কর্মকর্তা", number: inspector });

      const contacts = [oc, duty, inspector].filter(Boolean);

      return {
        id: `thana-${idx}`,
        type: "thana",
        categoryName: "পুলিশ থানা",
        name: item.name ? item.name.trim() : `পুলিশ থানা ${idx + 1}`,
        division: item.division ? item.division.trim() : "",
        lat: Number(item.latitude),
        lng: Number(item.longitude),
        contacts,
        contactRoles,
      };
    });
}

/**
 * Normalizes Highway Police Stations dataset
 * Input source: public/highwayThanaData.json
 */
export function normalizeHighwayThanas(data) {
  const rawList = Array.isArray(data)
    ? data
    : data?.highwayThanas || [];

  return rawList
    .filter(
      (item) =>
        item &&
        Array.isArray(item.coordinates) &&
        !isNaN(Number(item.coordinates[0])) &&
        !isNaN(Number(item.coordinates[1]))
    )
    .map((item, idx) => {
      const oc = item.mobile_oc ? String(item.mobile_oc).trim() : null;
      const duty = item.mobile_dutyOfficer
        ? String(item.mobile_dutyOfficer).trim()
        : null;
      const incharge = item.mobile_dutyincharge
        ? String(item.mobile_dutyincharge).trim()
        : null;

      const contactRoles = [];
      if (oc) contactRoles.push({ role: "ওসি", number: oc });
      if (duty) contactRoles.push({ role: "ডিউটি অফিসার", number: duty });
      if (incharge)
        contactRoles.push({ role: "ডিউটি ইনচার্জ", number: incharge });

      const contacts = [oc, duty, incharge].filter(Boolean);

      return {
        id: `highway-${idx}`,
        type: "highway",
        categoryName: "হাইওয়ে থানা",
        name: item.thana ? item.thana.trim() : `হাইওয়ে থানা ${idx + 1}`,
        division: item.region || item.circle || "হাইওয়ে পুলিশ",
        lat: Number(item.coordinates[0]),
        lng: Number(item.coordinates[1]),
        contacts,
        contactRoles,
        points: Array.isArray(item.points) ? item.points : [],
      };
    });
}

/**
 * Normalizes all three datasets simultaneously
 */
export function normalizeAllLocations({ armyData, thanaData, highwayData }) {
  const army = normalizeArmyCamps(armyData);
  const thanas = normalizePoliceThanas(thanaData);
  const highway = normalizeHighwayThanas(highwayData);

  return [...army, ...thanas, ...highway];
}

