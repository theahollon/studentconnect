"use client";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { t } from "@/lib/i18n/client";

export function EnvVarWarning() {
  return (
    <div className="flex gap-4 items-center">
      <Badge variant={"outline"} className="font-normal">
        {t("envVarWarning.badge")}
      </Badge>
      <div className="flex gap-2">
        <Button size="sm" variant={"outline"} disabled>
          {t("envVarWarning.signIn")}
        </Button>
        <Button size="sm" variant={"default"} disabled>
          {t("envVarWarning.signUp")}
        </Button>
      </div>
    </div>
  );
}