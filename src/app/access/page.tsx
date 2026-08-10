import { Suspense } from "react";
import SiteAccessForm from "@/components/SiteAccessForm";

export default function SiteAccessPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-black/60 dark:text-white/60">Reading the wards…</div>}>
      <SiteAccessForm />
    </Suspense>
  );
}

