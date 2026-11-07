# 🇧🇩 Bangladesh Army Camp & Police Thana Emergency Directory
### বাংলাদেশ সেনা ক্যাম্প, পুলিশ থানা ও হাইওয়ে থানা লোকেশন ও জরুরি যোগাযোগ ডিরেক্টরি

<div align="center">
  <img src="public/screenshot.png" alt="Bangladesh Emergency Directory Preview" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  
  <p align="center">
    <strong>An interactive emergency map and contact directory locating 740+ Bangladesh Army camps, Police Thanas, and Highway Police Stations across all districts.</strong>
    <br />
    <em>নিকটস্থ সেনা ক্যাম্প ও পুলিশ থানার অবস্থান, ওসি ও ডিউটি অফিসারের জরুরি নম্বর এবং সরাসরি লাইভ ড্রাইভিং রুট ম্যাপ।</em>
  </p>
  
  <p align="center">
    <a href="https://github.com/wapborhan/army-camp-location/stargazers"><img src="https://img.shields.io/github/stars/wapborhan/army-camp-location?color=10b981&style=flat-square" alt="Stars Badge"/></a>
    <a href="https://github.com/wapborhan/army-camp-location/network/members"><img src="https://img.shields.io/github/forks/wapborhan/army-camp-location?color=059669&style=flat-square" alt="Forks Badge"/></a>
    <a href="https://github.com/wapborhan/army-camp-location/issues"><img src="https://img.shields.io/github/issues/wapborhan/army-camp-location?color=047857&style=flat-square" alt="Issues Badge"/></a>
    <a href="https://github.com/wapborhan/army-camp-location/blob/main/LICENSE"><img src="https://img.shields.io/github/license/wapborhan/army-camp-location?color=065f46&style=flat-square" alt="License Badge"/></a>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15"/>
    <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19"/>
    <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS 4"/>
    <img src="https://img.shields.io/badge/Leaflet-1.9-green?style=flat-square&logo=leaflet" alt="Leaflet"/>
  </p>
</div>

---

## 🌟 Overview (প্রজেক্ট পরিচিতি)

**Emergency Camp & Thana Location** is a responsive, client-side interactive map and directory application built with **Next.js 15**, **React 19**, **Leaflet**, and **Tailwind CSS 4**. It provides citizens nationwide with instant access to 740+ verified emergency response posts across Bangladesh:

- 🛡️ **সেনা ক্যাম্প (Army Camps)**: 66 operational army camps with emergency hotline contacts (`public/armyCampData.json`).
- 👮 **পুলিশ থানা (Police Thanas)**: 598 regular police stations nationwide with direct contact details for OC, Duty Officer, and Inspector (`public/BDbdthanasData.json`).
- 🛣️ **হাইওয়ে থানা (Highway Police Stations)**: 78 highway police stations covering major national highways and expressways (`public/highwayThanaData.json`).

During national emergencies, natural disasters, highway accidents, or law-and-order situations, this tool allows users to:
1. **Browse in Full-Width View**: Browse all emergency stations in a fast, clutter-free 4-column responsive grid.
2. **Open Map on Demand**: View an interactive Leaflet map on the right side with a single click, or keep it collapsed for fast searching.
3. **Find Nearest Post**: Detect browser GPS coordinates and calculate distances using the Haversine formula.
4. **View Live Road Routes**: Draw actual road driving routes from user GPS location to any selected camp or thana via OSRM.
5. **Direct Role-Based Dialing**: One-tap phone calling to Officer-in-Charge (ওসি), Duty Officer, Inspector, or Camp Hotlines.
6. **One-Tap Share & Copy**: Share location details via WhatsApp, SMS, or Messenger, or copy numbers to clipboard.

---

## ✨ Key Features (প্রধান বৈশিষ্ট্যসমূহ)

### 🗺️ Conditional On-Demand Map (ক্লিক করলেই ম্যাপ ওপেন)
- **Full-Width Default Grid**: Initially, the app displays a full-screen, 4-column responsive cards directory, maximizing browsing space.
- **Show Map on Click**: Clicking **"ম্যাপ দেখুন"** in the header or toolbar, or clicking **"ফোকাস"** / **"রুট দেখুন"** on any card instantly opens the Leaflet map on the right side.
- **Close Map Anytime**: A high-contrast **"ম্যাপ বন্ধ করুন"** button (available in Header, Toolbar, and on top of the Map) collapses the map and restores the full-width card layout.
- **Synchronized Mobile & Desktop States**: Avoids state conflicts, ensuring seamless transitions between map and list views on any screen size.

### 🛡️ Interactive Leaflet Map with Custom Categorized Pins
- **Multi-Type Pins**:
  - 🛡️ **সেনা ক্যাম্প (Army)**: Emerald shield pin with gold star badge.
  - 👮 **পুলিশ থানা (Police Thana)**: Deep blue shield pin with badge icon.
  - 🛣️ **হাইওয়ে থানা (Highway Thana)**: Purple shield pin with road landmark icon.
- **Pulsing GPS Radar Marker**: Visual indicator of the user's detected location with a 1.2 km perimeter radar circle.
- **Interactive Marker Popups**: Detailed popup cards with phone dialers, role labels (ওসি, ডিউটি অফিসার, তদন্ত কর্মকর্তা), and direct navigation links.
- **Zero-Dimension Safety**: Automatic `map.invalidateSize()` calls and safe fallback zoom prevent Leaflet `flyTo` division-by-zero crashes.

### 🛣️ Live Driving Route (OSRM Road Navigation)
- **Road Network Routing**: Fetches real driving routes via the Open Source Routing Machine (OSRM) API.
- **Dual-Layer Glow Polyline**: High-visibility glowing navigation path on top of the dark map tiles.
- **Route Summary Card**: Displays driving distance in kilometers, estimated travel time in minutes, and a 1-tap button to open Google Maps turn-by-turn navigation.
- **Offline / Fallback Routing**: If routing servers are unreachable, automatically falls back to straight-line distance calculations.

### 🔍 Bilingual Smart Search & Division Filters
- **Instant Search**: Search in Bengali (e.g. `মিরপুর`, `ধানমন্ডি`, `উত্তরা`, `হাটিকুমরুল`), English aliases (`mirpur`, `dhanmondi`, `dhaka`, `ctg`), or by phone digits.
- **8 Administrative Divisions**: Quick-filter chips for **সকল**, **ঢাকা**, **চট্টগ্রাম**, **রাজশাহী**, **খুলনা**, **বরিশাল**, **সিলেট**, **রংপুর**, and **ময়মনসিংহ**.
- **Category Filter Pills**: Filter instantly by **সবগুলো (742)**, **সেনা (66)**, **থানা (598)**, or **হাইওয়ে (78)**.
- **Nearest 5 Locations**: One-click filter to display only the closest posts when GPS is active.

### 📞 Emergency Hotlines Directory
- **National Emergency 999**: Quick-dial button in the header.
- **Emergency Modal Directory**: Direct 1-tap dialer for:
  - জাতীয় জরুরি সেবা (National Emergency): **999**
  - সেনাসদর জরুরি কন্ট্রোল রুম (Army HQ Operations): **01769013000**
  - স্বাস্থ্য বাতায়ন (Health Services): **16263**
  - দুর্যোগ তথ্য সেবা (Disaster Warning): **1090**
  - নারী ও শিশু হেল্পলাইন (Women & Child Protection): **109**

### 📱 Mobile-First Responsive Design (`100dvh`)
- **True `100dvh` Viewport**: Zero mobile browser toolbar jump or vertical overflow.
- **Bottom Floating Switcher**: Thumb-friendly bottom toggle button on mobile to easily switch between **ম্যাপ ভিউ (Map View)** and **তালিকা ভিউ (List View)**.

---

## 📊 Data Normalization Schema (ডেটা নরমালাইজেশন)

The application unifies three heterogeneous JSON datasets into a single, strongly-structured schema using [`src/utils/normalizeData.js`](src/utils/normalizeData.js):

```typescript
interface NormalizedLocation {
  id: string;               // Unique ID: "army-0", "thana-12", "highway-5"
  type: "army" | "thana" | "highway";
  categoryName: string;     // "সেনা ক্যাম্প" | "পুলিশ থানা" | "হাইওয়ে থানা"
  name: string;             // Formatted Bengali name
  division: string;         // Administrative division
  lat: number;              // Verified floating-point latitude
  lng: number;              // Verified floating-point longitude
  contacts: string[];       // Dialable phone numbers
  contactRoles: Array<{     // Role-annotated contact list
    role: string;           // "ওসি", "ডিউটি অফিসার", "তদন্ত কর্মকর্তা", "হটলাইন ১"
    number: string;
  }>;
  points?: string[];        // Highway patrol points (if applicable)
}
```

### Dataset Sources:
1. `public/armyCampData.json`: 66 Army camps with name, lat, lng, and hotline contacts.
2. `public/BDbdthanasData.json`: 598 Police thanas with OC, Duty Officer, and Inspector numbers.
3. `public/highwayThanaData.json`: 78 Highway police stations with coordinates, circle, region, and patrol coverage points.

---

## 🛠️ Tech Stack (ব্যবহৃত প্রযুক্তিসমূহ)

| Technology | Purpose |
| :--- | :--- |
| **[Next.js 15](https://nextjs.org/)** | App Router framework with Client-Side Hydration |
| **[React 19](https://react.dev/)** | Component architecture & modern hooks |
| **[Leaflet](https://leafletjs.com/)** | Interactive Web Mapping Engine |
| **[React-Leaflet](https://react-leaflet.js.org/)** | React wrapper for Leaflet (dynamic `{ ssr: false }`) |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Styling, CSS variables & fluid animations |
| **[React Icons](https://react-icons.github.io/react-icons/)** | Feather (`fi`) vector iconography |
| **[OSRM API](http://project-osrm.org/)** | Open Source Routing Machine for live road polylines |
| **[OpenStreetMap](https://www.openstreetmap.org/)** | Map tile layer provider |

---

## 📁 Project Structure (ফাইল ও ফোল্ডার কাঠামো)

```text
army-camp-location/
├── public/
│   ├── armyCampData.json         # 66 army camp coordinates & hotline contacts
│   ├── BDbdthanasData.json       # 598 regular police thanas with OC contacts
│   ├── highwayThanaData.json     # 78 highway police stations with patrol points
│   ├── screenshot.png            # Application preview banner
│   └── wb-logo.png               # Developer brand logo
├── src/
│   ├── app/
│   │   ├── ArmyMap.js            # Main map, search, filters & routing controller
│   │   ├── globals.css           # Tailwind v4 directives, custom scrollbars
│   │   ├── layout.js             # Root HTML layout, SEO metadata & OpenGraph
│   │   ├── not-found.js          # Custom 404 page for Next.js App Router
│   │   └── page.js               # Multi-dataset loader & page entry
│   ├── components/
│   │   ├── CampCard.js           # Location card with dial, copy, share & route buttons
│   │   ├── EmergencyModal.js     # National emergency hotlines modal directory
│   │   ├── Header.js             # Branded topbar with 999 dialer & map toggle
│   │   └── SocialNavigation.js   # Floating developer & social links widget
│   └── utils/
│       ├── distance.js           # Haversine distance, Bengali numerals & division maps
│       └── normalizeData.js      # Universal dataset normalizer & schema validator
├── next.config.mjs               # Next.js configuration
├── package.json                  # Scripts & dependencies
└── README.md                     # Comprehensive project documentation
```

---

## 🚀 Getting Started (ইনস্টলেশন ও রান করার নিয়ম)

### Prerequisites
- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **Package Manager**: npm, pnpm, or yarn

### 1. Clone the repository
```bash
git clone https://github.com/wapborhan/army-camp-location.git
cd army-camp-location
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for production
```bash
npm run build
npm start
```

---

## 🤝 Contributing (অবদান রাখুন)

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License (লাইসেন্স)

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer & Author

Developed with care for public utility and emergency awareness in Bangladesh by:

**Borhan Uddin (WAP Borhan)**
- 🌐 Website: [code.wapborhan.com](https://code.wapborhan.com)
- 🐙 GitHub: [@wapborhan](https://github.com/wapborhan)
- 💼 LinkedIn: [wapborhan](https://www.linkedin.com/in/wapborhan/)
- 📘 Facebook: [wapborhan](https://www.facebook.com/wapborhan)

---

<div align="center">
  <sub>জনস্বার্থে ও জরুরি সহায়তার উদ্দেশ্যে প্রকাশিত। প্রয়োজনে সর্বদা জাতীয় জরুরি সেবা <b>৯৯৯</b> এ যোগাযোগ করুন।</sub>
</div>
