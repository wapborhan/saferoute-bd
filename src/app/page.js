"use client";

import { useEffect, useState } from "react";
import ArmyMap from "./ArmyMap";
import { normalizeAllLocations } from "@/utils/normalizeData";

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("armyCampData.json")
        .then((r) => r.json())
        .catch(() => []),
      fetch("BDbdthanasData.json")
        .then((r) => r.json())
        .catch(() => []),
      fetch("highwayThanaData.json")
        .then((r) => r.json())
        .catch(() => ({})),
    ])
      .then(([armyData, thanaData, highwayObj]) => {
        const unified = normalizeAllLocations({
          armyData,
          thanaData,
          highwayData: highwayObj,
        });
        setLocations(unified);
      })
      .catch((err) => console.error("Error loading location datasets:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="w-full min-h-screen bg-slate-950">
      <ArmyMap allLocations={locations} isLoading={loading} />
    </main>
  );
}
