"use client";

import { useState } from "react";
import {
  FiPhone,
  FiCopy,
  FiCheck,
  FiNavigation,
  FiMapPin,
  FiShare2,
} from "react-icons/fi";
import { toBengaliNumber, shareCampDetails } from "@/utils/distance";

export default function CampCard({
  camp,
  isSelected,
  onSelect,
  onNavigateMap,
  onShowRoute,
}) {
  const [copiedNumber, setCopiedNumber] = useState(null);
  const [isShared, setIsShared] = useState(false);

  const handleCopy = (e, number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const success = await shareCampDetails(camp);
    if (success) {
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    }
  };

  const handleDirections = (e) => {
    e.stopPropagation();
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${camp.lat},${camp.lng}`,
      "_blank"
    );
  };

  return (
    <div
      onClick={() => onSelect(camp)}
      className={`p-4 rounded-xl transition-all duration-200 cursor-pointer border text-left ${
        isSelected
          ? "bg-emerald-950/80 border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-emerald-950/50"
          : "bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-emerald-500/50 shadow-sm"
      }`}
    >
      {/* Top Header: Name & Distance */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
              isSelected
                ? "bg-amber-400 text-slate-950"
                : "bg-emerald-800/80 text-emerald-200"
            }`}
          >
            <FiMapPin className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-base text-white tracking-wide">
            {camp.name} সেনা ক্যাম্প
          </h3>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {camp.distance !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span>{toBengaliNumber(camp.distance)}</span> কিমি দূরে
            </span>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition"
            title="ক্যাম্পের বিবরণ ও লোকেশন শেয়ার করুন"
          >
            {isShared ? (
              <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <FiShare2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Contact Numbers List */}
      <div className="mb-3 space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          জরুরি যোগাযোগ নম্বর:
        </span>
        <div className="flex flex-wrap gap-2">
          {camp.contacts?.map((contact, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 bg-slate-800/90 hover:bg-emerald-900/60 border border-slate-700 hover:border-emerald-500/60 rounded-lg px-2.5 py-1 transition group"
            >
              <a
                href={`tel:${contact}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 group-hover:text-emerald-200"
                title="সরাসরি কল করতে ক্লিক করুন"
              >
                <FiPhone className="w-3 h-3 text-emerald-400" />
                <span>{contact}</span>
              </a>
              <button
                type="button"
                onClick={(e) => handleCopy(e, contact)}
                className="text-slate-400 hover:text-white p-0.5 ml-1 transition"
                title="নম্বরটি কপি করুন"
              >
                {copiedNumber === contact ? (
                  <FiCheck className="w-3 h-3 text-emerald-400" />
                ) : (
                  <FiCopy className="w-3 h-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigateMap(camp);
          }}
          className="flex items-center gap-1 text-slate-300 hover:text-emerald-300 font-semibold transition"
          title="ম্যাপে এই ক্যাম্পটি ফোকাস করুন"
        >
          <FiMapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>ফোকাস</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onShowRoute) onShowRoute(camp);
          }}
          className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 font-bold bg-emerald-900/60 hover:bg-emerald-800/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 shadow-sm transition"
          title="আপনার অবস্থান থেকে এই ক্যাম্পের রুট দেখুন"
        >
          <FiNavigation className="w-3.5 h-3.5 text-emerald-400" />
          <span>রুট দেখুন</span>
        </button>

        <button
          type="button"
          onClick={handleDirections}
          className="flex items-center gap-1 text-slate-400 hover:text-amber-300 font-medium transition"
          title="গুগল ম্যাপে বিস্তারিত রুট"
        >
          <span>গুগল ম্যাপ</span>
        </button>
      </div>
    </div>
  );
}
