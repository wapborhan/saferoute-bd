// Calculate distance between two coordinates in kilometers using Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Convert English numbers to Bengali numerals
export function toBengaliNumber(num) {
  if (num === null || num === undefined) return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[Number(digit)]);
}

// Transliteration / alias dictionary for common districts to support English searches
export const districtAliases = {
  dhaka: "ঢাকা",
  gazipur: "গাজীপুর",
  narayanganj: "নারায়নগঞ্জ",
  chattogram: "চট্টগ্রাম",
  chittagong: "চট্টগ্রাম",
  ctg: "চট্টগ্রাম",
  coxsbazar: "কক্সবাজার",
  cumilla: "কুমিল্লা",
  comilla: "কুমিল্লা",
  sylhet: "সিলেট",
  rajshahi: "রাজশাহী",
  khulna: "খুলনা",
  barishal: "বরিশাল",
  barisal: "বরিশাল",
  rangpur: "রংপুর",
  mymensingh: "ময়মনসিংহ",
  bogura: "বগুড়া",
  bogra: "বগুড়া",
  jashore: "যশোর",
  jessore: "যশোর",
  pabna: "পাবনা",
  tangail: "টাঙ্গাইল",
  feni: "ফেনী",
  noakhali: "নোয়াখালী",
  faridpur: "ফরিদপুর",
  dinajpur: "দিনাজপুর",
  kushtia: "কুষ্টিয়া",
  brahmanbaria: "ব্রাক্ষণবাড়ীয়া",
};

// 8 Divisions of Bangladesh
export const divisions = [
  "সকল",
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
];

// District to Division Mapping
export const districtDivisionMap = {
  // ঢাকা বিভাগ
  ঢাকা: "ঢাকা",
  গাজীপুর: "ঢাকা",
  নারায়নগঞ্জ: "ঢাকা",
  নারায়ণগঞ্জ: "ঢাকা",
  নরসিংদী: "ঢাকা",
  মুন্সিগঞ্জ: "ঢাকা",
  মানিকগঞ্জ: "ঢাকা",
  কিশোরগঞ্জ: "ঢাকা",
  টাঙ্গাইল: "ঢাকা",
  ফরিদপুর: "ঢাকা",
  মাদারীপুর: "ঢাকা",
  শরীয়তপুর: "ঢাকা",
  রাজবাড়ী: "ঢাকা",
  গোপালগঞ্জ: "ঢাকা",

  // চট্টগ্রাম বিভাগ
  চট্টগ্রাম: "চট্টগ্রাম",
  কক্সবাজার: "চট্টগ্রাম",
  কুমিল্লা: "চট্টগ্রাম",
  ব্রাক্ষণবাড়ীয়া: "চট্টগ্রাম",
  চাঁদপুর: "চট্টগ্রাম",
  ফেনী: "চট্টগ্রাম",
  নোয়াখালী: "চট্টগ্রাম",
  লক্ষীপুর: "চট্টগ্রাম",
  "Lohagara Upazila": "চট্টগ্রাম",
  "Patiya Upazila": "চট্টগ্রাম",
  "Chandanaish Upazila": "চট্টগ্রাম",
  "Banshkhali Upazila": "চট্টগ্রাম",
  "Satkania Upazila": "চট্টগ্রাম",

  // রাজশাহী বিভাগ
  রাজশাহী: "রাজশাহী",
  চাঁপাইনবাবগঞ্জ: "রাজশাহী",
  পাবনা: "রাজশাহী",
  সিরাজগঞ্জ: "রাজশাহী",
  নাটোর: "রাজশাহী",
  নওগাঁ: "রাজশাহী",
  জয়পুরহাট: "রাজশাহী",
  বগুড়া: "রাজশাহী",

  // খুলনা বিভাগ
  খুলনা: "খুলনা",
  বাগেরহাট: "খুলনা",
  কুষ্টিয়া: "খুলনা",
  চুয়াডাঙ্গা: "খুলনা",
  মেহেরপুর: "খুলনা",
  নড়াইল: "খুলনা",
  মাগুরা: "খুলনা",
  ঝিনাইদাহ: "খুলনা",
  যশোর: "খুলনা",
  সাতক্ষীরা: "খুলনা",

  // বরিশাল বিভাগ
  বরিশাল: "বরিশাল",
  পটুয়াখালী: "বরিশাল",
  ঝালকাঠি: "বরিশাল",
  পিরোজপুর: "বরিশাল",

  // সিলেট বিভাগ
  সিলেট: "সিলেট",
  হবিগঞ্জ: "সিলেট",
  সুনামগঞ্জ: "সিলেট",
  মৌলভীবাজার: "সিলেট",

  // রংপুর বিভাগ
  রংপুর: "রংপুর",
  দিনাজপুর: "রংপুর",
  নীলফামারী: "রংপুর",
  লালমনিরহাট: "রংপুর",
  কুড়িগ্রাম: "রংপুর",
  ঠাকুরগাঁও: "রংপুর",
  পঞ্চগড়: "রংপুর",
  গাইবান্ধা: "রংপুর",

  // ময়মনসিংহ বিভাগ
  ময়মনসিংহ: "ময়মনসিংহ",
  শেরপুর: "ময়মনসিংহ",
  নেত্রকোনা: "ময়মনসিংহ",
  জামালপুর: "ময়মনসিংহ",
};

// Share camp details via Web Share API or Clipboard
export async function shareCampDetails(camp) {
  const shareText = `🇧🇩 ${camp.name} সেনা ক্যাম্প\n📞 জরুরি যোগাযোগ: ${camp.contacts?.join(", ")}\n📍 লোকেশন ম্যাপ: https://www.google.com/maps?q=${camp.lat},${camp.lng}`;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: `${camp.name} সেনা ক্যাম্প`,
        text: shareText,
        url: `https://www.google.com/maps?q=${camp.lat},${camp.lng}`,
      });
      return true;
    } catch {
      // User cancelled or share dismissed
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
