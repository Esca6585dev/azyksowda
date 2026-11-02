import { BadgePercent, ShieldCheck, Truck, Wallet } from "lucide-react";

const FEATURES = [
  { icon: Truck, title: "Çalt eltip bermek", text: "Aşgabat boýunça 1-2 sagatda" },
  { icon: BadgePercent, title: "Hepdelik arzanladyşlar", text: "Her hepde täze teklipler" },
  { icon: ShieldCheck, title: "Hil kepilligi", text: "Diňe täze we barlanan harytlar" },
  { icon: Wallet, title: "Amatly töleg", text: "Nagt ýa-da kart bilen eltilende" },
];

export default function FeatureStrip() {
  return (
    <div className="wrap -mt-6 relative z-10 sm:-mt-8">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-3 shadow-card sm:gap-3 sm:p-4 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-center gap-3 rounded-xl p-2 sm:p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 sm:h-12 sm:w-12">
              <f.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{f.title}</div>
              <div className="truncate text-xs text-muted">{f.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
