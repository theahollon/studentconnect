OVERSATTEKST (EN/IT) – KORT GUIDE

1) Keys må finnes i begge filer:
   - /public/locales/en/common.json
   - /public/locales/it/common.json

2) Vi bruker FLATE keys (med punktum), f.eks:
   "activityForm.heading": "Create activity"

CLIENT COMPONENTS (filer med "use client")
- Import:
  import { t } from "@/lib/i18n/client";
- Bruk:
  {t("activityForm.heading")}

  Ergo: importer t fra client versjonen, og der tekst skal skrives lager vi heller et keyword som legges inn i common filene. 
  deretter bruker vi keywordet slik: {t("keyword")}

SERVER COMPONENTS (default i app/)
- Import:
  import { t } from "@/lib/i18n/server";
- Bruk:
  const heading = t("activityForm.heading");
  {heading}

I motsettning til client versjonen må vi her hente oversettelsen først og lagre den i en variabel. 
deretter brukes variabelen somm vanlig. 

VIKTIG:
- Ikke importer "@/lib/i18n/client" i server components.
- Restart dev-server etter endring av JSON-filer.