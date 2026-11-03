"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, PartyPopper } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useFetch } from "@/lib/hooks";
import type { Order } from "@/lib/types";
import { toast } from "@/store/ui";
import OrderDetail from "@/components/account/OrderDetail";
import Button, { btnClass } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function MyOrderPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, loading, error, reload } = useFetch<Order>(`/api/orders/${id}`);
  // this page only mounts client-side (account layout waits for auth hydration), so window is available
  const [isNew] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "1");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const cancel = async () => {
    setBusy(true);
    try {
      await api(`/api/orders/${id}/cancel`, { method: "POST" });
      toast("Sargyt ýatyryldy", "info");
      setConfirm(false);
      reload();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Näsazlyk", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Sargytlarym
      </Link>

      {isNew && order && (
        <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-800 animate-slide-up">
          <PartyPopper className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" />
          <div>
            <div className="font-bold">Sargydyňyz kabul edildi!</div>
            <div className="text-sm">Sargyt belgisi: <b>{order.number}</b>. Operatorymyz tiz wagtda {order.phone} belgä jaň edip tassyklar.</div>
          </div>
        </div>
      )}

      {loading && !order ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : order ? (
        <OrderDetail
          order={order}
          actions={
            order.status === "pending" ? (
              <div className="rounded-2xl bg-card p-5 shadow-card">
                <h3 className="font-bold">Sargydy ýatyrmak</h3>
                <p className="mt-1 text-sm text-muted">Sargyt tassyklanmanka ýatyryp bilersiňiz.</p>
                <Button variant="danger" className="mt-3 w-full" onClick={() => setConfirm(true)}>
                  Sargydy ýatyr
                </Button>
              </div>
            ) : (
              <Link href="/catalog" className={btnClass("primary", "md", "w-full")}>
                Täzeden sargyt bermek
              </Link>
            )
          }
        />
      ) : null}

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Sargydy ýatyrmalymy?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Ýok
            </Button>
            <Button variant="danger" onClick={cancel} loading={busy}>
              Hawa, ýatyr
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">Bu amaly yzyna gaýtaryp bolmaýar. Harytlar ammara gaýtarylar.</p>
      </Modal>
    </div>
  );
}
