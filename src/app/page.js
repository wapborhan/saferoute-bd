"use client";

import { useEffect, useState } from "react";
import ArmyMap from "./ArmyMap";

export default function Home() {
  const [allCamps, setAllCamps] = useState([]);

  useEffect(() => {
    fetch("armyCampData.json")
      .then((res) => res.json())
      .then((data) => setAllCamps(data))
      .catch((err) => console.error("Error loading camp data:", err));
  }, []);

  return (
    <main className="w-full min-h-screen bg-slate-950">
      <ArmyMap allCamps={allCamps} />
    </main>
  );
}
