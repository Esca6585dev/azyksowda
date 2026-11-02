"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { useFetch } from "@/lib/hooks";
import type { Product } from "@/lib/types";
import { ErrorBox, PageHeader } from "@/components/admin/ui";
import ProductForm from "@/components/admin/ProductForm";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useFetch<Product>(`/api/admin/products/${id}`);
  if (error) return <ErrorBox message={error} />;
  if (loading || !data) return <Skeleton className="h-96" />;
  return (
    <div>
      <PageHeader
        title={data.name}
        subtitle={`#${data.id} · ${data.slug}`}
        actions={
          <Link href={`/product/${data.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            Saýtda gör <ExternalLink className="h-4 w-4" />
          </Link>
        }
      />
      <ProductForm initial={data} />
    </div>
  );
}
