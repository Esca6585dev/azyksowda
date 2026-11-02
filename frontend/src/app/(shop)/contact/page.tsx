import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { fetchSiteConfig } from "@/lib/api";
import { btnClass } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Habarlaşmak", description: "AzykSowda bilen habarlaşmak: telefon, e-poçta, salgy we iş wagty." };

export default async function ContactPage() {
  const site = await fetchSiteConfig();
  const cards = [
    { icon: Phone, title: "Telefon", lines: [site.phone, site.phone2], href: `tel:${site.phone.replace(/\s/g, "")}`, cta: "Jaň etmek" },
    { icon: Mail, title: "E-poçta", lines: [site.email], href: `mailto:${site.email}`, cta: "Hat ýazmak" },
    { icon: MapPin, title: "Salgy", lines: [site.address] },
    { icon: Clock, title: "Iş wagty", lines: [site.work_hours, "Eltip bermek: 09:00 - 22:00"] },
  ];
  return (
    <div className="wrap py-8 sm:py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight">Biz bilen habarlaşyň</h1>
        <p className="mt-2 text-muted">Sargyt, eltip bermek ýa-da hyzmatdaşlyk boýunça soraglaryňyz bolsa, bize ýüz tutuň. Her gün jogap berýäris.</p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.title} className="flex flex-col rounded-2xl bg-white p-6 shadow-card">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <c.icon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-bold">{c.title}</h2>
            <div className="mt-1 space-y-0.5 text-sm text-gray-700">
              {c.lines.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
            {c.href && (
              <a href={c.href} className={btnClass("soft", "sm", "mt-4 w-fit")}>
                {c.cta}
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="text-lg font-bold">Eltip bermek şertleri</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>• Aşgabat şäheri boýunça 1-2 sagadyň içinde eltip berýäris.</li>
            <li>• {site.free_delivery_from} manatdan ýokary sargytlara eltip bermek mugt, ondan aşak sargytlara {site.delivery_fee} manat.</li>
            <li>• Töleg eltilende nagt ýa-da bank karty bilen (terminal) kabul edilýär.</li>
            <li>• Haryt hiline nägile bolsaňyz, kurýere şol ýerde yzyna gaýtaryp bilersiňiz.</li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 p-6 text-white shadow-card">
          <h2 className="text-lg font-bold">Hyzmatdaşlyk</h2>
          <p className="mt-2 text-sm text-white/90">Önüm öndüriji ýa-da üpjün ediji bolsaňyz, harytlaryňyzy AzykSowda-da ýerleşdirmek üçin bize ýazyň. Ýerli öndürijileri goldaýarys.</p>
          <a href={`mailto:${site.email}?subject=Hyzmatdaslyk`} className={btnClass("ghost", "md", "mt-4 bg-white text-brand-700 hover:bg-brand-50 hover:text-brand-700")}>
            Teklip ibermek
          </a>
        </div>
      </div>
    </div>
  );
}
