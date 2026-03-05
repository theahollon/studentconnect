// React hooks
import { useMemo, useState, useEffect } from "react";

// Supabase client factory
import { createClient } from "@/lib/supabase/client";

// i18n (client)
import { t } from "@/lib/i18n/client";


export default function CompanyForm() {
  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Create Company</h1>

    </div>
  );
}