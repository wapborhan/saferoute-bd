"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";
import {
  FiSearch,
  FiX,
  FiNavigation,
  FiCompass,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiMap,
  FiList,
} from "react-icons/fi";
import CampCard from "@/components/CampCard";
import Header from "@/components/Header";
import EmergencyModal from "@/components/EmergencyModal";
import SocialNavigation from "@/components/SocialNavigation";
import {
  calculateDistance,
  toBengaliNumber,
  districtAliases,
  divisions,
  districtDivisionMap,
} from "@/utils/distance";

// Dynamically import react-leaflet components to ensure ssr: false
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false },
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);

// Default Bangladesh center coordinates
const BD_CENTER = [23.685, 90.3563];
const BD_DEFAULT_ZOOM = 7.5;

// Safely check if a coordinate pair contains valid geographic numbers
function isValidLatLng(coords) {
  if (!coords) return false;
  const lat = Array.isArray(coords) ? Number(coords[0]) : Number(coords.lat);
  const lng = Array.isArray(coords) ? Number(coords[1]) : Number(coords.lng);
  return (
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

// Map View Controller for Pan/Zoom, Route Bounds Fitting, and InvalidateSize
function MapController({ targetCenter, targetZoom, routeBounds, mobileView }) {
  const map = useMap();

  // Invalidate size on initial mount and whenever mobile view changes
  useEffect(() => {
    if (!map) return;
    const invalidate = () => {
      try {
        map.invalidateSize();
      } catch (err) {
        console.warn("Map invalidate error:", err);
      }
    };

    invalidate();
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 300);
    const t3 = setTimeout(invalidate, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map, mobileView]);

  // Adjust center/zoom or fit route bounds safely without division by zero
  useEffect(() => {
    if (!map) return;

    try {
      if (
        routeBounds &&
        Array.isArray(routeBounds) &&
        routeBounds.length === 2 &&
        isValidLatLng(routeBounds[0]) &&
        isValidLatLng(routeBounds[1])
      ) {
        map.fitBounds(routeBounds, {
          padding: [50, 50],
          maxZoom: 14,
          animate: true,
        });
        map.invalidateSize();
      } else if (isValidLatLng(targetCenter)) {
        const safeCenter = [Number(targetCenter[0]), Number(targetCenter[1])];
        const safeZoom = Number(targetZoom) || 13;
        const size = map.getSize();

        // If map container is not yet measured (size is 0,0 on mobile view switch),
        // use setView instead of flyTo to avoid Leaflet internal division by zero (NaN, NaN)
        if (!size || size.x <= 0 || size.y <= 0) {
          map.setView(safeCenter, safeZoom);
        } else {
          try {
            map.flyTo(safeCenter, safeZoom, {
              duration: 1.2,
              easeLinearity: 0.25,
            });
          } catch {
            map.setView(safeCenter, safeZoom);
          }
        }
        map.invalidateSize();
      }
    } catch (err) {
      console.warn("Map navigation safely handled:", err);
    }
  }, [map, targetCenter, targetZoom, routeBounds, mobileView]);

  return null;
}

export default function ArmyMap({ allCamps = [] }) {
  const [leaflet, setLeaflet] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [locating, setLocating] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [mapCenter, setMapCenter] = useState(BD_CENTER);
  const [mapZoom, setMapZoom] = useState(BD_DEFAULT_ZOOM);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'nearest'
  const [selectedDivision, setSelectedDivision] = useState("সকল");
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [mobileView, setMobileView] = useState("map"); // 'map' | 'list'

  // Route state
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [isRouteActive, setIsRouteActive] = useState(false);

  const markerRefs = useRef({});

  // Asynchronously load Leaflet client-side only
  useEffect(() => {
    import("leaflet").then((mod) => {
      setLeaflet(mod.default || mod);
    });
  }, []);

  // Custom SVG Pin for Army Camps
  const campIcon = useMemo(() => {
    if (!leaflet) return undefined;
    return leaflet.divIcon({
      className: "custom-camp-pin",
      html: `
        <div style="transform: translate(-50%, -100%);" class="relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110 z-10">
          <div class="w-8 h-8 rounded-full bg-emerald-800 ring-2 ring-white shadow-emerald-950/60 shadow-lg flex items-center justify-center text-white transition-all">
            <svg class="w-4 h-4 text-amber-300 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 4.5l2.2 4.45 4.9.71-3.55 3.46.84 4.88L12 17.7l-4.39 2.3.84-4.88-3.55-3.46 4.9-.71L12 6.5z"/>
            </svg>
          </div>
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-emerald-800"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -38],
    });
  }, [leaflet]);

  // Selected Pin in Gold/Amber
  const selectedCampIcon = useMemo(() => {
    if (!leaflet) return undefined;
    return leaflet.divIcon({
      className: "custom-camp-pin-selected",
      html: `
        <div style="transform: translate(-50%, -100%);" class="relative flex flex-col items-center cursor-pointer transition-transform duration-200 scale-125 z-[1000]">
          <div class="w-8 h-8 rounded-full bg-amber-400 ring-4 ring-amber-300/80 shadow-amber-500/50 shadow-lg flex items-center justify-center text-slate-950 transition-all">
            <svg class="w-4 h-4 text-slate-950 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 4.5l2.2 4.45 4.9.71-3.55 3.46.84 4.88L12 17.7l-4.39 2.3.84-4.88-3.55-3.46 4.9-.71L12 6.5z"/>
            </svg>
          </div>
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-400"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -38],
    });
  }, [leaflet]);

  // Custom User Location Pin
  const userPinIcon = useMemo(() => {
    if (!leaflet) return undefined;
    return leaflet.divIcon({
      className: "custom-user-pin",
      html: `
        <div style="transform: translate(-50%, -50%);" class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 bg-blue-500/50 rounded-full animate-ping"></span>
          <div class="relative w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -15],
    });
  }, [leaflet]);

  // Calculate camps with distance when userLocation is present
  const campsWithDistance = useMemo(() => {
    return allCamps.map((camp) => {
      if (!userLocation) return camp;
      const dist = calculateDistance(
        userLocation[0],
        userLocation[1],
        camp.lat,
        camp.lng,
      );
      return { ...camp, distance: dist };
    });
  }, [allCamps, userLocation]);

  // Filtered and sorted camps
  const displayedCamps = useMemo(() => {
    let list = [...campsWithDistance];

    // Filter by division if selected
    if (selectedDivision && selectedDivision !== "সকল") {
      list = list.filter(
        (camp) => districtDivisionMap[camp.name] === selectedDivision,
      );
    }

    // If search query exists
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const aliasTarget = districtAliases[query] || "";
      list = list.filter((camp) => {
        const nameMatch = camp.name.toLowerCase().includes(query);
        const aliasMatch = aliasTarget && camp.name.includes(aliasTarget);
        const contactMatch = camp.contacts?.some((c) =>
          c.replace(/[^0-9]/g, "").includes(query.replace(/[^0-9]/g, "")),
        );
        return nameMatch || aliasMatch || contactMatch;
      });
    }

    // Sort by distance if user location is known
    if (userLocation) {
      list.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
    }

    // If filterMode is 'nearest'
    if (filterMode === "nearest" && userLocation) {
      return list.slice(0, 5);
    }

    return list;
  }, [
    campsWithDistance,
    searchQuery,
    filterMode,
    selectedDivision,
    userLocation,
  ]);

  // Find user's location via browser GPS
  const handleFindLocation = (callback) => {
    if (!navigator.geolocation) {
      alert("আপনার ব্রাউজারে লোকেশন সার্ভিস সাপোর্ট করছে না।");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const coords = [lat, lon];
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(12);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=bn`,
          );
          const data = await res.json();
          setLocationName(data.display_name || "আপনার বর্তমান অবস্থান");
        } catch {
          setLocationName("আপনার বর্তমান অবস্থান পাওয়া গেছে");
        } finally {
          setLocating(false);
          if (callback) callback(coords);
        }
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        alert(
          "আপনার অবস্থান নির্ণয় করা সম্ভব হয়নি। অনুগ্রহ করে ব্রাউজারের লোকেশন পারমিশন দিন।",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  // Select camp and open popup
  const handleSelectCamp = (camp, shouldSwitchMobile = false) => {
    if (!camp || !isValidLatLng([camp.lat, camp.lng])) return;
    const safeLat = Number(camp.lat);
    const safeLng = Number(camp.lng);

    setSelectedCamp(camp);
    setMapCenter([safeLat, safeLng]);
    setMapZoom(13);

    if (shouldSwitchMobile) {
      setMobileView("map");
    }

    setTimeout(() => {
      const marker = markerRefs.current[`${safeLat}-${safeLng}`];
      if (marker) {
        marker.openPopup();
      }
    }, 400);
  };

  // Trigger routing to a camp
  const handleShowRoute = (camp) => {
    if (!camp || !isValidLatLng([camp.lat, camp.lng])) return;
    const safeLat = Number(camp.lat);
    const safeLng = Number(camp.lng);

    setSelectedCamp(camp);
    setMapCenter([safeLat, safeLng]);
    setIsRouteActive(true);
    setMobileView("map");

    if (!userLocation) {
      handleFindLocation(() => {
        // Location fetched, route effect will automatically trigger
      });
    }
  };

  // Clear active route
  const handleClearRoute = () => {
    setIsRouteActive(false);
    setRouteData(null);
  };

  // Fetch routing coordinates between userLocation and selectedCamp
  useEffect(() => {
    if (!userLocation || !selectedCamp || !isRouteActive) {
      setRouteData(null);
      return;
    }

    let isMounted = true;
    setRouteLoading(true);

    const userLat = userLocation[0];
    const userLon = userLocation[1];
    const campLat = selectedCamp.lat;
    const campLon = selectedCamp.lng;

    const fallbackStraightLine = () => {
      const dist = calculateDistance(userLat, userLon, campLat, campLon);
      const estMinutes = Math.max(1, Math.round((dist / 35) * 60)); // ~35 km/h average driving speed
      return {
        coordinates: [
          [userLat, userLon],
          [campLat, campLon],
        ],
        distance: dist,
        duration: estMinutes,
        isFallback: true,
      };
    };

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${campLon},${campLat}?overview=full&geometries=geojson`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("OSRM routing unavailable");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(([lon, lat]) => [
            lat,
            lon,
          ]);
          const distKm = Number((route.distance / 1000).toFixed(1));
          const durationMin = Math.max(1, Math.round(route.duration / 60));
          setRouteData({
            coordinates: coords,
            distance: distKm,
            duration: durationMin,
            isFallback: false,
          });
        } else {
          setRouteData(fallbackStraightLine());
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setRouteData(fallbackStraightLine());
      })
      .finally(() => {
        if (isMounted) setRouteLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userLocation, selectedCamp, isRouteActive]);

  // Compute bounding box for map view when route is visible
  const routeBounds = useMemo(() => {
    if (
      userLocation &&
      selectedCamp &&
      isRouteActive &&
      routeData?.coordinates?.length
    ) {
      return [userLocation, [selectedCamp.lat, selectedCamp.lng]];
    }
    return null;
  }, [userLocation, selectedCamp, isRouteActive, routeData]);

  // Reset map view to entire Bangladesh
  const handleResetMap = () => {
    setSelectedCamp(null);
    setIsRouteActive(false);
    setRouteData(null);
    setMapCenter(BD_CENTER);
    setMapZoom(BD_DEFAULT_ZOOM);
  };

  // Pan to user location
  const handlePanToUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(13);
    } else {
      handleFindLocation();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
      {/* Header */}
      <Header
        totalCamps={allCamps.length}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        mobileView={mobileView}
        setMobileView={setMobileView}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row relative w-full h-[calc(100dvh-64px)] overflow-hidden">
        {/* Left Sidebar / List View */}
        <aside
          className={`w-full md:w-[420px] lg:w-[460px] xl:w-[500px] flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-20 transition-all ${
            mobileView === "list" ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Top Actions: Search & GPS Finder */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-sm space-y-3 flex-shrink-0">
            {/* GPS Location Trigger */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleFindLocation()}
                disabled={locating}
                className={`w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md ${
                  locating
                    ? "bg-slate-800 text-emerald-400 cursor-wait border border-emerald-500/40"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 hover:shadow-emerald-900/40 hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                <FiCompass
                  className={`w-4 h-4 ${locating ? "animate-spin text-emerald-400" : ""}`}
                />
                <span>
                  {locating
                    ? "অবস্থান নির্ণয় হচ্ছে..."
                    : userLocation
                      ? "অবস্থান পুনরায় খুঁজুন"
                      : "আমার অবস্থান খুঁজুন (GPS)"}
                </span>
              </button>

              {/* Detected User Location Card */}
              {userLocation && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-emerald-300">
                        আপনার বর্তমান অবস্থান:
                      </div>
                      <div className="text-slate-300 line-clamp-2 mt-0.5">
                        {locationName || "অক্ষাংশ/দ্রাঘিমাংশ শনাক্ত হয়েছে"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUserLocation(null);
                      setLocationName("");
                      setFilterMode("all");
                      handleClearRoute();
                    }}
                    className="text-slate-400 hover:text-red-400 transition p-1"
                    title="অবস্থান মুছুন"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="জেলা বা ক্যাম্পের নাম খুঁজুন (যেমন: ঢাকা, কুমিল্লা)..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Tabs: All vs Nearest */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition border ${
                  filterMode === "all"
                    ? "bg-slate-800 text-emerald-300 border-emerald-500/40 shadow-sm"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                সবগুলো ({toBengaliNumber(allCamps.length)})
              </button>

              {userLocation && (
                <button
                  type="button"
                  onClick={() => setFilterMode("nearest")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition border ${
                    filterMode === "nearest"
                      ? "bg-emerald-900/60 text-emerald-300 border-emerald-500/60 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  নিকটস্থ ৫টি
                </button>
              )}
            </div>

            {/* Division Filter Chips with Horizontal Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 custom-scrollbar text-xs">
              {divisions.map((divName) => (
                <button
                  key={divName}
                  onClick={() => setSelectedDivision(divName)}
                  className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedDivision === divName
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {divName}
                </button>
              ))}
            </div>
          </div>

          {/* Camp Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar pb-24 md:pb-6">
            {displayedCamps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <p className="text-sm">কোনো সেনা ক্যাম্পের তথ্য পাওয়া যায়নি।</p>
                <p className="text-xs text-slate-500">
                  অন্য কোনো জেলা বা সঠিক বানানে অনুসন্ধান করুন।
                </p>
                {(searchQuery || selectedDivision !== "সকল") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDivision("সকল");
                    }}
                    className="mt-2 text-xs text-emerald-400 hover:underline"
                  >
                    ফিল্টার রিসেট করুন
                  </button>
                )}
              </div>
            ) : (
              displayedCamps.map((camp, idx) => (
                <CampCard
                  key={idx}
                  camp={camp}
                  isSelected={
                    selectedCamp?.name === camp.name &&
                    selectedCamp?.lat === camp.lat
                  }
                  onSelect={(c) => handleSelectCamp(c, true)}
                  onNavigateMap={(c) => handleSelectCamp(c, true)}
                  onShowRoute={(c) => handleShowRoute(c)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Right Map Workspace */}
        <section
          className={`flex-1 relative w-full h-full min-h-[300px] bg-slate-900 ${
            mobileView === "map"
              ? "flex flex-col"
              : "hidden md:flex md:flex-col"
          }`}
        >
          {/* Floating Map Overlays & Control Toolbar */}
          <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
            <button
              onClick={handlePanToUser}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-850 text-white rounded-xl shadow-lg border border-slate-700/80 hover:border-emerald-500/50 backdrop-blur-sm transition hover:scale-105 active:scale-95 group"
              title="আমার লোকেশন দেখুন"
            >
              <FiNavigation className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition" />
            </button>
            <button
              onClick={handleResetMap}
              className="p-2.5 bg-slate-900/90 hover:bg-slate-850 text-white rounded-xl shadow-lg border border-slate-700/80 hover:border-emerald-500/50 backdrop-blur-sm transition hover:scale-105 active:scale-95 group"
              title="সমগ্র বাংলাদেশ দেখুন (রিসেট)"
            >
              <FiRefreshCw className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition" />
            </button>
          </div>

          {/* Floating Route Information Card */}
          {isRouteActive && selectedCamp && (
            <div className="absolute bottom-20 md:bottom-6 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[500] bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-4 shadow-2xl shadow-slate-950/80 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <FiNavigation className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      রুট ও নেভিগেশন
                    </h4>
                    <span className="text-[11px] text-emerald-400">
                      আপনার অবস্থান ➔ {selectedCamp.name} ক্যাম্প
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClearRoute}
                  className="p-1 text-slate-400 hover:text-white rounded-md transition"
                  title="রুট বন্ধ করুন"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {routeLoading ? (
                <div className="py-3 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>রুট ম্যাপ হিসাব করা হচ্ছে...</span>
                </div>
              ) : routeData ? (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-slate-400 block">
                        ড্রাইভিং দূরত্ব
                      </span>
                      <span className="text-base font-extrabold text-emerald-300">
                        {toBengaliNumber(routeData.distance)} কিমি
                      </span>
                    </div>
                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-slate-400 block">
                        আনুমানিক সময়
                      </span>
                      <span className="text-base font-extrabold text-amber-300">
                        ~{toBengaliNumber(routeData.duration)} মিনিট
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {userLocation && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${selectedCamp.lat},${selectedCamp.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                      >
                        <FiNavigation className="w-3.5 h-3.5" />
                        <span>গুগল ম্যাপে লাইভ রুট</span>
                      </a>
                    )}
                    {selectedCamp.contacts?.[0] && (
                      <a
                        href={`tel:${selectedCamp.contacts[0]}`}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl border border-slate-700 transition"
                      >
                        <FiPhone className="w-3.5 h-3.5" />
                        <span>কল করুন</span>
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-2 text-center text-xs text-slate-400">
                  রুট লোড করা সম্ভব হয়নি।
                </div>
              )}
            </div>
          )}

          {/* Leaflet Map Container */}
          <div className="w-full h-full relative flex-1 min-h-[300px]">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom
              className="w-full h-full"
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                inset: 0,
              }}
            >
              <MapController
                targetCenter={mapCenter}
                targetZoom={mapZoom}
                routeBounds={routeBounds}
                mobileView={mobileView}
              />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Active Route Polyline */}
              {routeData?.coordinates?.length > 0 && (
                <>
                  {/* Route Glow / Outer Border */}
                  <Polyline
                    positions={routeData.coordinates}
                    pathOptions={{
                      color: routeData.isFallback ? "#b45309" : "#064e3b",
                      weight: 8,
                      opacity: 0.65,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  />
                  {/* Core Route Line */}
                  <Polyline
                    positions={routeData.coordinates}
                    pathOptions={{
                      color: routeData.isFallback ? "#f59e0b" : "#10b981",
                      weight: 5,
                      opacity: 0.95,
                      dashArray: routeData.isFallback ? "8, 8" : undefined,
                      lineCap: "round",
                      lineJoin: "round",
                    }}
                  />
                </>
              )}

              {/* User GPS Radar Circle & Marker */}
              {userLocation && (
                <>
                  <Circle
                    center={userLocation}
                    radius={1200}
                    pathOptions={{
                      fillColor: "#3b82f6",
                      fillOpacity: 0.15,
                      color: "#2563eb",
                      weight: 1.5,
                    }}
                  />
                  <Marker position={userLocation} icon={userPinIcon}>
                    <Popup>
                      <div className="p-1 text-center font-sans">
                        <div className="font-bold text-blue-700 text-xs">
                          📍 আপনার বর্তমান অবস্থান
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 max-w-[180px]">
                          {locationName || "GPS অবস্থান সনাক্ত করা হয়েছে"}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {/* Camp Markers */}
              {displayedCamps.map((camp, idx) => {
                const isSelected =
                  selectedCamp?.name === camp.name &&
                  selectedCamp?.lat === camp.lat;

                return (
                  <Marker
                    key={`${camp.lat}-${camp.lng}-${idx}`}
                    position={[camp.lat, camp.lng]}
                    icon={isSelected ? selectedCampIcon : campIcon}
                    ref={(ref) => {
                      if (ref) {
                        markerRefs.current[`${camp.lat}-${camp.lng}`] = ref;
                      }
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedCamp(camp);
                      },
                    }}
                  >
                    <Popup>
                      <div className="p-1 font-sans text-slate-900 min-w-[200px]">
                        {/* Popup Header */}
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5 mb-2">
                          <div className="w-5 h-5 rounded-md bg-emerald-800 text-white flex items-center justify-center text-[10px]">
                            ⭐
                          </div>
                          <h4 className="font-bold text-sm text-emerald-950">
                            {camp.name} সেনা ক্যাম্প
                          </h4>
                        </div>

                        {/* Distance if available */}
                        {camp.distance !== undefined && (
                          <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded px-2 py-0.5 mb-2 inline-block">
                            ⚡ দূরত্ব: {toBengaliNumber(camp.distance)} কিমি
                          </div>
                        )}

                        {/* Show Route Button in Popup */}
                        <button
                          type="button"
                          onClick={() => handleShowRoute(camp)}
                          className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded shadow-sm transition mb-2"
                        >
                          <FiNavigation className="w-3 h-3 text-amber-300" />
                          <span>এখানে যাওয়ার রুট দেখুন</span>
                        </button>

                        {/* Contact numbers */}
                        <div className="space-y-1 mb-2.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            যোগাযোগ নম্বর:
                          </span>
                          {camp.contacts?.map((contact, i) => (
                            <a
                              key={i}
                              href={`tel:${contact}`}
                              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded transition"
                            >
                              <FiPhone className="w-3 h-3 text-emerald-600" />
                              <span>{contact}</span>
                            </a>
                          ))}
                        </div>

                        {/* External Google Maps Link */}
                        <a
                          href={
                            userLocation
                              ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${camp.lat},${camp.lng}`
                              : `https://www.google.com/maps/dir/?api=1&destination=${camp.lat},${camp.lng}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 w-full py-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
                        >
                          <FiCompass className="w-3 h-3 text-slate-500" />
                          <span>গুগল ম্যাপে নেভিগেশন</span>
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </section>
      </div>

      {/* Floating Mobile Toggle Switcher at Bottom */}
      {/* <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1000] flex md:hidden items-center bg-slate-900/95 backdrop-blur-md p-1.5 rounded-full border border-emerald-500/40 shadow-2xl shadow-black/80">
        <button
          onClick={() => setMobileView("map")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
            mobileView === "map"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <FiMap className="w-4 h-4" />
          <span>ম্যাপ ভিউ</span>
        </button>
        <button
          onClick={() => setMobileView("list")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
            mobileView === "list"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
              : "text-slate-300 hover:text-white"
          }`}
        >
          <FiList className="w-4 h-4" />
          <span>ক্যাম্প তালিকা ({toBengaliNumber(displayedCamps.length)})</span>
        </button>
      </div> */}

      {/* Emergency Hotline Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Floating Developer / Social Widget */}
      <SocialNavigation />
    </div>
  );
}
