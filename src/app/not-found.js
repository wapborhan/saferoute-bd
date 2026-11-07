import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-extrabold text-emerald-400 mb-2">৪০৪</h1>
      <h2 className="text-xl font-bold mb-4">পৃষ্ঠাটি পাওয়া যায়নি</h2>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        আপনি যে পৃষ্ঠাটি খুঁজছেন তা স্থানান্তরিত বা মুছে ফেলা হয়েছে।
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"
      >
        মূল পাতায় ফিরে যান
      </Link>
    </div>
  );
}

