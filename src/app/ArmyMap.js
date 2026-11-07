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
  FiShield,
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
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
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
function MapController({
  targetCenter,
  targetZoom,
  routeBounds,
  mobileView,
  isMapVisible,
}) {
  const map = useMap();

  // Invalidate size on initial mount and whenever mobile view or desktop map visibility changes
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
  }, [map, mobileView, isMapVisible]);

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

        // If map container is not yet measured (size is 0,0 on view switch),
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
  }, [map, targetCenter, targetZoom, routeBounds, mobileView, isMapVisible]);

  return null;
}

export default function ArmyMap({ allLocations = [], allCamps = [] }) {
  const [leaflet, setLeaflet] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [locating, setLocating] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [mapCenter, setMapCenter] = useState(BD_CENTER);
  const [mapZoom, setMapZoom] = useState(BD_DEFAULT_ZOOM);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'nearest'
  const [selectedCategory, setSelectedCategory] = useState("all"); // 'all' | 'army' | 'thana' | 'highway'
  const [selectedDivision, setSelectedDivision] = useState("সকল");
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // 'map' | 'list'
  const [isMapVisible, setIsMapVisible] = useState(false); // Controls desktop right-side map visibility

  // Route state
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [isRouteActive, setIsRouteActive] = useState(false);

  const markerRefs = useRef({});

  // Use allLocations or fall back to allCamps
  const rawLocations = useMemo(() => {
    if (allLocations && allLocations.length > 0) return allLocations;
    if (allCamps && allCamps.length > 0) {
      return allCamps.map((item, idx) => ({
        id: `army-${idx}`,
        type: "army",
        categoryName: "সেনা ক্যাম্প",
        name: item.name.includes("ক্যাম্প") ? item.name : `${item.name} সেনা ক্যাম্প`,
        lat: Number(item.lat),
        lng: Number(item.lng),
        contacts: item.contacts || [],
        contactRoles: (item.contacts || []).map((num, i) => ({
          role: `হটলাইন ${i + 1}`,
          number: num,
        })),
      }));
    }
    return [];
  }, [allLocations, allCamps]);

  // Asynchronously load Leaflet client-side only
  useEffect(() => {
    import("leaflet").then((mod) => {
      setLeaflet(mod.default || mod);
    });
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    let army = 0, thana = 0, highway = 0;
    rawLocations.forEach((item) => {
      if (item.type === "army") army++;
      else if (item.type === "highway") highway++;
      else thana++;
    });
    return {
      all: rawLocations.length,
      army,
      thana,
      highway,
    };
  }, [rawLocations]);

  // Distinct Vector Pins for Army, Thana, and Highway
  const iconsMap = useMemo(() => {
    if (!leaflet) return {};

    const createPin = (type, isSelected) => {
      const isArmy = type === "army";
      const isHighway = type === "highway";

      let bg = isArmy
        ? "bg-emerald-800 ring-2 ring-white shadow-emerald-950/60"
        : isHighway
        ? "bg-purple-800 ring-2 ring-white shadow-purple-950/60"
        : "bg-blue-800 ring-2 ring-white shadow-blue-950/60";

      let borderT = isArmy
        ? "border-t-emerald-800"
        : isHighway
        ? "border-t-purple-800"
        : "border-t-blue-800";

      if (isSelected) {
        bg = "bg-amber-400 ring-4 ring-amber-300 shadow-amber-500/50";
        borderT = "border-t-amber-400";
      }

      const emoji = isArmy ? "⭐" : isHighway ? "🛣️" : "👮";

      return leaflet.divIcon({
        className: `custom-pin-${type}`,
        html: `
          <div style="transform: translate(-50%, -100%);" class="relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${
            isSelected ? "scale-125 z-[1000]" : "hover:scale-110 z-10"
          }">
            <div class="w-8 h-8 rounded-full ${bg} shadow-lg flex items-center justify-center text-xs font-bold text-white transition-all">
              <span>${emoji}</span>
            </div>
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${borderT}"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -38],
      });
    };

    return {
      army: createPin("army", false),
      armySelected: createPin("army", true),
      thana: createPin("thana", false),
      thanaSelected: createPin("thana", true),
      highway: createPin("highway", false),
      highwaySelected: createPin("highway", true),
    };
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

  // Calculate distance when userLocation is present
  const locationsWithDistance = useMemo(() => {
    return rawLocations.map((item) => {
      if (!userLocation) return item;
      const dist = calculateDistance(
        userLocation[0],
        userLocation[1],
        item.lat,
        item.lng
      );
      return { ...item, distance: dist };
    });
  }, [rawLocations, userLocation]);

  // Filtered and sorted locations
  const displayedLocations = useMemo(() => {
    let list = [...locationsWithDistance];

    // Filter by Category (army, thana, highway)
    if (selectedCategory !== "all") {
      list = list.filter((item) => item.type === selectedCategory);
    }

    // Filter by Division
    if (selectedDivision && selectedDivision !== "সকল") {
      list = list.filter((item) => {
        if (item.division && item.division.includes(selectedDivision)) return true;
        const mapped = districtDivisionMap[item.name.replace(/ থানা| সেনা ক্যাম্প/g, "")];
        return mapped === selectedDivision;
      });
    }

    // Filter by Search Query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const aliasTarget = districtAliases[query] || "";
      list = list.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const aliasMatch = aliasTarget && item.name.includes(aliasTarget);
        const divMatch = item.division && item.division.toLowerCase().includes(query);
        const contactMatch = item.contacts?.some((c) =>
          c.replace(/[^0-9]/g, "").includes(query.replace(/[^0-9]/g, ""))
        );
        return nameMatch || aliasMatch || divMatch || contactMatch;
      });
    }

    // Sort by distance if user location is known
    if (userLocation) {
      list.sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
    }

    // Filter nearest 5
    if (filterMode === "nearest" && userLocation) {
      return list.slice(0, 5);
    }

    return list;
  }, [
    locationsWithDistance,
    selectedCategory,
    selectedDivision,
    searchQuery,
    filterMode,
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
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=bn`
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
          "আপনার অবস্থান নির্ণয় করা সম্ভব হয়নি। অনুগ্রহ করে ব্রাউজারের লোকেশন পারমিশন দিন।"
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
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
    setIsMapVisible(true);

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
    setIsMapVisible(true);
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
      const estMinutes = Math.max(1, Math.round((dist / 35) * 60)); // ~35 km/h avg speed
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
      `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${campLon},${campLat}?overview=full&geometries=geojson`
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
    if (userLocation && selectedCamp && isRouteActive && routeData?.coordinates?.length) {
      return [
        userLocation,
        [selectedCamp.lat, selectedCamp.lng],
      ];
    }
    return null;
  }, [userLocation, selectedCamp, isRouteActive, routeData]);

  // Open map view (both mobile and desktop)
  const handleOpenMap = () => {
    setIsMapVisible(true);
    setMobileView("map");
  };

  // Close map view (both mobile and desktop)
  const handleCloseMap = () => {
    setIsMapVisible(false);
    setMobileView("list");
  };

  // Toggle map view
  const handleToggleMap = () => {
    if (isMapVisible || mobileView === "map") {
      handleCloseMap();
    } else {
      handleOpenMap();
    }
  };

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
        totalLocations={rawLocations.length}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        mobileView={mobileView}
        isMapVisible={isMapVisible}
        onOpenMap={handleOpenMap}
        onCloseMap={handleCloseMap}
        onToggleMap={handleToggleMap}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row relative w-full h-[calc(100dvh-64px)] overflow-hidden">
        {/* Left Sidebar / List View */}
        <aside
          className={`bg-slate-900 flex flex-col h-full z-20 transition-all duration-300 ${
            mobileView === "list" ? "flex" : "hidden md:flex"
          } ${
            isMapVisible
              ? "w-full md:w-[440px] lg:w-[480px] xl:w-[500px] flex-shrink-0 md:border-r md:border-slate-800"
              : "w-full border-r-0"
          }`}
        >
          {/* Top Actions: Search, Category Tabs & GPS Finder */}
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

            {/* Category Filter Pills: All vs Army vs Thana vs Highway */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`py-1.5 px-1 rounded-lg transition text-center truncate ${
                  selectedCategory === "all"
                    ? "bg-slate-800 text-emerald-300 shadow-sm border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                সব ({toBengaliNumber(categoryCounts.all)})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("army")}
                className={`py-1.5 px-1 rounded-lg transition text-center truncate ${
                  selectedCategory === "army"
                    ? "bg-emerald-900/70 text-emerald-200 shadow-sm border border-emerald-500/50"
                    : "text-slate-400 hover:text-emerald-300"
                }`}
              >
                সেনা ({toBengaliNumber(categoryCounts.army)})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("thana")}
                className={`py-1.5 px-1 rounded-lg transition text-center truncate ${
                  selectedCategory === "thana"
                    ? "bg-blue-900/70 text-blue-200 shadow-sm border border-blue-500/50"
                    : "text-slate-400 hover:text-blue-300"
                }`}
              >
                থানা ({toBengaliNumber(categoryCounts.thana)})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("highway")}
                className={`py-1.5 px-1 rounded-lg transition text-center truncate ${
                  selectedCategory === "highway"
                    ? "bg-purple-900/70 text-purple-200 shadow-sm border border-purple-500/50"
                    : "text-slate-400 hover:text-purple-300"
                }`}
              >
                হাইওয়ে ({toBengaliNumber(categoryCounts.highway)})
              </button>
            </div>

            {/* Search Input Bar & Map Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="থানা, ক্যাম্প বা ফোন নম্বর খুঁজুন (যেমন: মিরপুর, উত্তরা)..."
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

              {/* Show/Hide Map Toggle Button (Desktop) */}
              <button
                type="button"
                onClick={handleToggleMap}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition shadow-sm border whitespace-nowrap ${
                  isMapVisible
                    ? "bg-red-950/80 hover:bg-red-900 text-red-200 border-red-500/50 hover:text-white"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-500/40 shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98]"
                }`}
                title={
                  isMapVisible
                    ? "ডানপাশের ম্যাপ বন্ধ করুন"
                    : "ডানপাশে ম্যাপ প্রদর্শন করুন"
                }
              >
                {isMapVisible ? (
                  <>
                    <FiX className="w-4 h-4 text-red-400" />
                    <span>ম্যাপ বন্ধ করুন</span>
                  </>
                ) : (
                  <>
                    <FiMap className="w-4 h-4 text-white" />
                    <span>ম্যাপ দেখুন</span>
                  </>
                )}
              </button>
            </div>

            {/* Nearest Filter Pill */}
            {userLocation && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode("all")}
                  className={`flex-1 py-1 px-3 rounded-lg text-xs font-semibold transition border ${
                    filterMode === "all"
                      ? "bg-slate-800 text-emerald-300 border-emerald-500/40 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  তালিকার সবগুলো ({toBengaliNumber(displayedLocations.length)})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode("nearest")}
                  className={`flex-1 py-1 px-3 rounded-lg text-xs font-semibold transition border ${
                    filterMode === "nearest"
                      ? "bg-emerald-900/60 text-emerald-300 border-emerald-500/60 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  নিকটস্থ ৫টি
                </button>
              </div>
            )}

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

          {/* Camp & Thana Cards List */}
          <div
            className={`flex-1 overflow-y-auto p-4 custom-scrollbar pb-24 md:pb-6 ${
              isMapVisible
                ? "space-y-3"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 max-w-[1600px] mx-auto w-full"
            }`}
          >
            {displayedLocations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2 col-span-full">
                <p className="text-sm">
                  কোনো ক্যাম্প বা থানার তথ্য পাওয়া যায়নি।
                </p>
                <p className="text-xs text-slate-500">
                  অন্য কোনো নাম, এরিয়া বা সঠিক বানানে অনুসন্ধান করুন।
                </p>
                {(searchQuery || selectedDivision !== "সকল" || selectedCategory !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDivision("সকল");
                      setSelectedCategory("all");
                    }}
                    className="mt-2 text-xs text-emerald-400 hover:underline"
                  >
                    ফিল্টার রিসেট করুন
                  </button>
                )}
              </div>
            ) : (
              displayedLocations.map((item, idx) => (
                <CampCard
                  key={item.id || idx}
                  camp={item}
                  isSelected={
                    selectedCamp?.name === item.name &&
                    selectedCamp?.lat === item.lat
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
        {(isMapVisible || mobileView === "map") && (
          <section
            className={`relative w-full h-full min-h-[300px] bg-slate-900 ${
              mobileView === "map" ? "flex flex-col z-10" : "hidden"
            } ${
              isMapVisible ? "md:flex md:flex-col md:flex-1" : "md:hidden"
            }`}
          >
            {/* Top Left Close Map Button (Desktop & Mobile) */}
            <div className="absolute top-4 left-4 z-[500]">
              <button
                type="button"
                onClick={handleCloseMap}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold rounded-xl shadow-lg border border-slate-700/80 hover:border-red-500/50 backdrop-blur-sm transition hover:scale-105 active:scale-95 group"
                title="ডানপাশের ম্যাপ বন্ধ করুন"
              >
                <FiX className="w-4 h-4 text-red-400 group-hover:rotate-90 transition" />
                <span>ম্যাপ বন্ধ করুন</span>
              </button>
            </div>

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
                      আপনার অবস্থান ➔ {selectedCamp.name}
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
              style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            >
              <MapController
                targetCenter={mapCenter}
                targetZoom={mapZoom}
                routeBounds={routeBounds}
                mobileView={mobileView}
                isMapVisible={isMapVisible}
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

              {/* Location Markers (Army, Thana, Highway) */}
              {displayedLocations.map((item, idx) => {
                const isSelected =
                  selectedCamp?.name === item.name &&
                  selectedCamp?.lat === item.lat;

                const iconKey = isSelected
                  ? `${item.type || "thana"}Selected`
                  : item.type || "thana";

                const isArmy = item.type === "army";
                const isHighway = item.type === "highway";

                return (
                  <Marker
                    key={item.id || `${item.lat}-${item.lng}-${idx}`}
                    position={[item.lat, item.lng]}
                    icon={iconsMap[iconKey] || iconsMap.thana}
                    ref={(ref) => {
                      if (ref) {
                        markerRefs.current[`${item.lat}-${item.lng}`] = ref;
                      }
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedCamp(item);
                      },
                    }}
                  >
                    <Popup>
                      <div className="p-1 font-sans text-slate-900 min-w-[220px]">
                        {/* Popup Header with Badge */}
                        <div className="border-b border-slate-200 pb-2 mb-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isArmy
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isHighway
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {item.categoryName || (isArmy ? "সেনা ক্যাম্প" : isHighway ? "হাইওয়ে থানা" : "পুলিশ থানা")}
                            </span>
                            {item.division && (
                              <span className="text-[10px] text-slate-500">
                                {item.division}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">
                            {item.name}
                          </h4>
                        </div>

                        {/* Distance if available */}
                        {item.distance !== undefined && (
                          <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded px-2 py-0.5 mb-2 inline-block">
                            ⚡ দূরত্ব: {toBengaliNumber(item.distance)} কিমি
                          </div>
                        )}

                        {/* Show Route Button in Popup */}
                        <button
                          type="button"
                          onClick={() => handleShowRoute(item)}
                          className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded shadow-sm transition mb-2"
                        >
                          <FiNavigation className="w-3 h-3 text-amber-300" />
                          <span>এখানে যাওয়ার রুট দেখুন</span>
                        </button>

                        {/* Contact numbers with roles */}
                        <div className="space-y-1 mb-2.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            জরুরি যোগাযোগ:
                          </span>
                          {item.contactRoles && item.contactRoles.length > 0
                            ? item.contactRoles.map((c, i) => (
                                <a
                                  key={i}
                                  href={`tel:${c.number}`}
                                  className="flex items-center justify-between text-xs font-semibold text-slate-800 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2 py-1 rounded transition"
                                >
                                  <span className="text-slate-500 text-[11px] font-medium">
                                    {c.role}:
                                  </span>
                                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                    <FiPhone className="w-3 h-3 text-emerald-600" />
                                    <span>{c.number}</span>
                                  </span>
                                </a>
                              ))
                            : item.contacts?.map((contact, i) => (
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
                              ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${item.lat},${item.lng}`
                              : `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`
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
      )}
      </div>

      

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
