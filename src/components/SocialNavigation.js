"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaGithub,
  FaLinkedin,
  FaFacebookSquare,
  FaCodepen,
} from "react-icons/fa";
import { FiShare2, FiX } from "react-icons/fi";

export default function SocialNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col items-end gap-2">
      {/* Floating expanded menu */}
      {isOpen && (
        <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 animate-fadeIn min-w-[180px]">
          <div className="text-[11px] font-semibold text-emerald-400 px-2 py-1 border-b border-slate-800">
            ডেভেলপার ও সামাজিক যোগাযোগ
          </div>
          <Link
            href="https://github.com/wapborhan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition"
          >
            <FaGithub className="w-4 h-4 text-emerald-400" />
            <span>GitHub Profile</span>
          </Link>
          <Link
            href="https://www.facebook.com/wapborhan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition"
          >
            <FaFacebookSquare className="w-4 h-4 text-blue-400" />
            <span>Facebook</span>
          </Link>
          <Link
            href="https://www.linkedin.com/in/wapborhan/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition"
          >
            <FaLinkedin className="w-4 h-4 text-sky-400" />
            <span>LinkedIn</span>
          </Link>
          <Link
            href="https://codepen.io/wapborhan"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition"
          >
            <FaCodepen className="w-4 h-4 text-amber-400" />
            <span>CodePen</span>
          </Link>
        </div>
      )}

      {/* Main trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/60 border-2 border-emerald-400/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        title="ডেভেলপার সংযোগ ও সোশ্যাল মিডিয়া"
        aria-label="Toggle developer links"
      >
        {isOpen ? (
          <FiX className="w-5 h-5 text-white" />
        ) : (
          <FiShare2 className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
}
