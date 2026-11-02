"use client";

import { PageHeader } from "@/components/admin/ui";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="Täze haryt" subtitle="Kataloga täze haryt goşuň" />
      <ProductForm />
    </div>
  );
}
