import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";
import type { Category, SiteConfig } from "@/lib/types";

export default function Footer({ site, categories }: { site: SiteConfig; categories: Category[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-[#1d2b22] text-[#cfd8d2]" id="contact">
      <div className="wrap grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed">
            Aşgabat şäheri boýunça täze azyk harytlaryny amatly bahadan öýüňize çenli eltip berýäris. 200 manatdan ýokary sargytlara eltip bermek mugt.
          </p>
          <div className="mt-4 flex gap-2 text-xs">
            <span className="rounded-md bg-white/10 px-2 py-1">Nagt</span>
            <span className="rounded-md bg-white/10 px-2 py-1">Bank karty</span>
            <span className="rounded-md bg-white/10 px-2 py-1">Terminal</span>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-base font-bold text-white">Biz bilen habarlaşyň</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <span>{site.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <span>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {site.phone}
                </a>
                <br />
                <a href={`tel:${site.phone2.replace(/\s/g, "")}`} className="hover:text-white">
                  {site.phone2}
                </a>
              </span>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <span>{site.work_hours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-base font-bold text-white">Kategoriýalar</h3>
          <ul className="grid grid-cols-1 gap-2 text-sm">
            {categories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link href={`/catalog?category=${c.slug}`} className="hover:text-white">
                  {c.emoji} {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-base font-bold text-white">Sahypalar</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Baş sahypa</Link></li>
            <li><Link href="/catalog" className="hover:text-white">Katalog</Link></li>
            <li><Link href="/catalog?discount=1" className="hover:text-white">Arzanladyşlar</Link></li>
            <li><Link href="/account/orders" className="hover:text-white">Sargytlarym</Link></li>
            <li><Link href="/contact" className="hover:text-white">Habarlaşmak</Link></li>
            <li><Link href="/login" className="hover:text-white">Içeri gir</Link></li>
            <li><Link href="/register" className="hover:text-white">Hasap açmak</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs sm:text-sm">
        Awtorlyk hukugy © {year} AzykSowda. Ähli hukuklar goralan. <span className="opacity-70">azyksowda.com.tm</span>
      </div>
      <div className="h-16 md:hidden" aria-hidden="true" />
    </footer>
  );
}
