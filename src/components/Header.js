"use client";

import {
  FiShield,
  FiPhoneCall,
  FiMap,
  FiList,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import { toBengaliNumber } from "@/utils/distance";

export default function Header({
  totalLocations = 742,
  onOpenEmergency,
  mobileView,
  isMapVisible = false,
  onOpenMap,
  onCloseMap,
  onToggleMap,
}) {
  return (
    <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white border-b border-emerald-500/20 shadow-lg sticky top-0 z-30 backdrop-blur-md bg-opacity-95 h-16 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 p-[2px] shadow-md shadow-emerald-950/50 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
              <FiShield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-lg tracking-tight text-white  items-center gap-2 hidden lg:flex">
                <span>সেনা ক্যাম্প ও থানা লোকেশন</span>
              </h1>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center">
                {toBengaliNumber(totalLocations)} লোকেশন
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70 hidden lg:block">
              সেনা ক্যাম্প, পুলিশ থানা ও হাইওয়ে থানা যোগাযোগ ডিরেক্টরি
            </p>
          </div>
        </div>

        {/* View Switcher for Screens below md (768px) */}
        <div className="flex md:hidden items-center bg-slate-900/90 p-1 rounded-xl border border-emerald-500/30">
          <button
            onClick={() => {
              if (onOpenMap) onOpenMap();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mobileView === "map"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <FiMap className="w-3.5 h-3.5" />
            <span>ম্যাপ</span>
          </button>
          <button
            onClick={() => {
              if (onCloseMap) onCloseMap();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mobileView === "list"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <FiList className="w-3.5 h-3.5" />
            <span>তালিকা</span>
          </button>
        </div>

        {/* Action Controls & Emergency Helpline */}
        <div className="flex items-center gap-2">
          {/* Desktop Map Toggle Button */}
          {onToggleMap && (
            <button
              type="button"
              onClick={onToggleMap}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition shadow-sm ${
                isMapVisible
                  ? "bg-red-950/80 hover:bg-red-900 text-red-200 border-red-500/50 shadow-red-950/50"
                  : "bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 border-emerald-500/40 shadow-emerald-950/50"
              }`}
              title={
                isMapVisible
                  ? "ডানপাশের ম্যাপ বন্ধ করুন"
                  : "ডানপাশে ম্যাপ প্রদর্শন করুন"
              }
            >
              {isMapVisible ? (
                <>
                  <FiX className="w-3.5 h-3.5 text-red-400" />
                  <span>ম্যাপ বন্ধ করুন</span>
                </>
              ) : (
                <>
                  <FiMap className="w-3.5 h-3.5 text-emerald-300" />
                  <span>ম্যাপ দেখুন</span>
                </>
              )}
            </button>
          )}

          <a
            href="tel:999"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold shadow-md shadow-red-950/40 border border-red-500/30 transition hover:scale-105 active:scale-95"
            title="জাতীয় জরুরি সেবা ৯৯৯ এ কল করুন"
          >
            <FiAlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="hidden xs:inline">জরুরি ৯৯৯</span>
            <span className="xs:hidden">৯৯৯</span>
          </a>

          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 text-xs font-semibold border border-emerald-500/30 shadow-sm transition hover:scale-105 active:scale-95"
          >
            <FiPhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">জরুরি হটলাইন</span>
          </button>
        </div>
      </div>
    </header>
  );
}
