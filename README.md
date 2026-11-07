# 🇧🇩 Bangladesh Army Camp Location & Emergency Directory
### বাংলাদেশ সেনাবাহিনী ক্যাম্প লোকেশন ও জরুরি যোগাযোগ ডিরেক্টরি

<div align="center">
  <img src="public/screenshot.png" alt="Bangladesh Army Camp Location App Preview" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  
  <p align="center">
    <strong>An interactive emergency map and contact directory locating Bangladesh Army camps across all 64+ districts.</strong>
    <br />
    <em>নিকটস্থ সেনা ক্যাম্পের অবস্থান, জরুরি যোগাযোগ নম্বর এবং সরাসরি লাইভ ড্রাইভিং রুট ম্যাপ।</em>
  </p>
  
  <p align="center">
    <a href="https://github.com/wapborhan/army-camp-location/stargazers"><img src="https://img.shields.io/github/stars/wapborhan/army-camp-location?color=10b981&style=flat-square" alt="Stars Badge"/></a>
    <a href="https://github.com/wapborhan/army-camp-location/network/members"><img src="https://img.shields.io/github/forks/wapborhan/army-camp-location?color=059669&style=flat-square" alt="Forks Badge"/></a>
    <a href="https://github.com/wapborhan/army-camp-location/issues"><img src="https://img.shields.io/github/issues/wapborhan/army-camp-location?color=047857&style=flat-square" alt="Issues Badge"/></a>
    <a href="https://github.com/wapborhan/army-camp-location/blob/main/LICENSE"><img src="https://img.shields.io/github/license/wapborhan/army-camp-location?color=065f46&style=flat-square" alt="License Badge"/></a>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15"/>
    <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19"/>
    <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS 4"/>
  </p>
</div>

---

## 🌟 Overview (প্রজেক্ট পরিচিতি)

**Army Camp Location** is a responsive, client-side interactive map application built with **Next.js 15**, **React 19**, **Leaflet**, and **Tailwind CSS 4**. It provides citizens with instant access to Bangladesh Army emergency camps and control room phone numbers nationwide.

During national emergencies, natural disasters, or law-and-order situations, this tool allows users to:
1. **Find their nearest army camp** using browser GPS and Haversine distance calculations.
2. **View live driving road routes** on the map directly from their current location to the selected camp.
3. **Initiate one-touch phone calls** to verified emergency hotline numbers.
4. **Share camp location and contacts** with family and friends via WhatsApp, Messenger, or SMS.

---

## ✨ Key Features (প্রধান বৈশিষ্ট্যসমূহ)

### 🗺️ Interactive Leaflet Map
- **Custom Army Shield Pins**: Styled vector pins with gold stars for camps, highlighting with an amber glow when selected.
- **Pulsing GPS Radar Marker**: Visual indicator of the user's detected location with a 1.2 km perimeter circle.
- **Interactive Marker Popups**: Detailed camp popup cards with phone dialers, navigation links, and distance indicators.

### 🛣️ Driving Route to Selected Camp
- **OSRM Road Routing**: Fetches actual road network routes via the Open Source Routing Machine API.
- **Dual-Layer Route Polyline**: Glowing emerald border with high-visibility core navigation line.
- **Route Summary Card**: Displays real-time driving distance in kilometers, estimated travel time in minutes, and a button to launch Google Maps turn-by-turn navigation.
- **Offline / Fallback Routing**: If routing servers are unreachable, automatically falls back to straight-line distance calculations.

### 🔍 Bilingual Smart Search & Division Filters
- **Instant Search**: Search in Bengali (e.g. `ঢাকা`, `কুমিল্লা`, `চট্টগ্রাম`), English aliases (`dhaka`, `comilla`, `sylhet`, `ctg`), or by phone digits.
- **8 Administrative Divisions**: Filter chips for **সকল**, **ঢাকা**, **চট্টগ্রাম**, **রাজশাহী**, **খুলনা**, **বরিশাল**, **সিলেট**, **রংপুর**, and **ময়মনসিংহ**.
- **Nearest 5 Camps**: One-click filter to display only the closest camps when GPS is active.

### 📞 Emergency Hotlines Directory
- **National Emergency 999**: Quick-dial pill in the header.
- **Emergency Modal Directory**: Direct access to:
  - জাতীয় জরুরি সেবা (National Emergency): **999**
  - সেনাসদর জরুরি কন্ট্রোল রুম (Army HQ Operations): **01769013000**
  - স্বাস্থ্য বাতায়ন (Health Services): **16263**
  - দুর্যোগ তথ্য সেবা (Disaster Warning): **1090**
  - নারী ও শিশু হেল্পলাইন (Women & Child Protection): **109**

### 📱 Mobile-First Responsive Design
- **Guaranteed Full Viewport (`100dvh`)**: Zero container height collapse on mobile screens.
- **Floating View Switcher**: Thumb-friendly bottom toggle button on mobile to easily switch between **ম্যাপ ভিউ (Map View)** and **ক্যাম্প তালিকা (Camp List)**.
- **Zero-Dimension Protection**: Prevents Leaflet `flyTo` division-by-zero crashes on mobile tab transitions.

---

## 🛠️ Tech Stack (ব্যবহৃত প্রযুক্তিসমূহ)

| Technology | Purpose |
| :--- | :--- |
| **[Next.js 15](https://nextjs.org/)** | React Framework with App Router |
| **[React 19](https://react.dev/)** | Core UI Component Architecture |
| **[Leaflet](https://leafletjs.com/)** | Interactive Web Mapping Engine |
| **[React-Leaflet](https://react-leaflet.js.org/)** | React Components for Leaflet Maps |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Modern Utility-First CSS & Gradients |
| **[React Icons](https://react-icons.github.io/react-icons/)** | Feather & FontAwesome Vector Icons |
| **[OSRM API](http://project-osrm.org/)** | Open Source Routing Machine for Road Navigation |
| **[OpenStreetMap](https://www.openstreetmap.org/)** | Open Map Tile Layer |

---

## 📁 Project Structure (ফাইল ও ফোল্ডার কাঠামো)

```text
army-camp-location/
├── public/
│   ├── armyCampData.json         # 66 army camp coordinates & contact details
│   ├── screenshot.png            # Application preview image
│   └── wb-logo.png               # Developer brand logo
├── src/
│   ├── app/
│   │   ├── ArmyMap.js            # Main map, search, and routing controller
│   │   ├── globals.css           # Tailwind v4, custom scrollbars & Leaflet styles
│   │   ├── layout.js             # Root layout with metadata and OpenGraph tags
│   │   └── page.js               # Main page entry loading camp data
│   ├── components/
│   │   ├── CampCard.js           # Camp card with dial, copy, share, and route buttons
│   │   ├── EmergencyModal.js     # National emergency hotlines directory modal
│   │   ├── Header.js             # Branded topbar with 999 dialer and mobile tabs
│   │   └── SocialNavigation.js   # Floating developer & social links widget
│   └── utils/
│       └── distance.js           # Haversine distance, Bengali numerals & division maps
├── next.config.mjs               # Next.js configuration
├── package.json                  # Scripts & dependencies
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started (ইনস্টলেশন ও রান করার নিয়ম)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: npm, yarn, or pnpm

### 1. Clone the repository
```bash
git clone https://github.com/wapborhan/army-camp-location.git
cd army-camp-location
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Start development server
```bash
npm run dev
# or
yarn dev
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
