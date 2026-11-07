"use client";

import { FiPhone, FiX, FiAlertTriangle, FiShield, FiHeart } from "react-icons/fi";

const emergencyNumbers = [
  {
    category: "জাতীয় জরুরি সেবা",
    name: "জাতীয় জরুরি সেবা (পুলিশ, ফায়ার সার্ভিস, অ্যাম্বুলেন্স)",
    number: "999",
    desc: "টোল ফ্রি, যেকোনো সিম থেকে ২৪ ঘণ্টা চালু",
    icon: FiAlertTriangle,
    color: "from-red-600 to-rose-700",
  },
  {
    category: "সেনাবাহিনী জরুরি কন্ট্রোল",
    name: "সেনা সদর জরুরি অপারেশন কন্ট্রোল রুম",
    number: "01769013000",
    desc: "বাংলাদেশ সেনাবাহিনী প্রধান জরুরি সহায়তা ও যোগাযোগ",
    icon: FiShield,
    color: "from-emerald-700 to-teal-800",
  },
  {
    category: "স্বাস্থ্য বাতায়ন",
    name: "স্বাস্থ্য অধিদপ্তরের জরুরি স্বাস্থ্য সেবা",
    number: "16263",
    desc: "২৪ ঘণ্টা বিশেষজ্ঞ ডাক্তারের পরামর্শ",
    icon: FiHeart,
    color: "from-blue-600 to-indigo-700",
  },
  {
    category: "দুর্যোগ ব্যবস্থাপনা",
    name: "জাতীয় দুর্যোগ আগাম সতর্কবার্তা ও তথ্য",
    number: "1090",
    desc: "বন্যা, ঘূর্ণিঝড় ও প্রাকৃতিক দুর্যোগ সহায়তা",
    icon: FiAlertTriangle,
    color: "from-amber-600 to-orange-700",
  },
  {
    category: "নারী ও শিশু সুরক্ষা",
    name: "নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন",
    number: "109",
    desc: "টোল ফ্রি ২৪ ঘণ্টা জাতীয় হেল্পলাইন",
    icon: FiShield,
    color: "from-purple-600 to-pink-700",
  },
];

export default function EmergencyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                জরুরি হটলাইন নম্বরসমূহ
              </h3>
              <p className="text-xs text-emerald-200/70">
                যেকোনো জরুরি প্রয়োজনে সরাসরি কল করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          {emergencyNumbers.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 rounded-xl p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md flex-shrink-0 mt-0.5`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <a
                  href={`tel:${item.number}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-emerald-600/30 transition flex-shrink-0"
                >
                  <FiPhone className="w-4 h-4" />
                  <span>{item.number}</span>
                </a>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>সাধারণ তথ্য ও জনস্বার্থে প্রকাশিত</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

