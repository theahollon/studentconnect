OVERSATTEKST (EN/IT) – KORT GUIDE

1) Keys må finnes i begge filer:
   - /public/locales/en/common.json
   - /public/locales/it/common.json

2) Vi bruker FLATE keys (med punktum), f.eks:
   "activityForm.heading": "Create activity"

3) Navnerom (namespaces) – grupper keys etter funksjon:
   - activityForm.*   → skjema for å opprette aktivitet
   - auth.*           → innlogging, registrering, passord
   - rootNav.*        → navigasjonsmeny
   - home.*           → startsiden
   - profile.*        → brukerprofil (studieprogram, allergier)
   - eventsPage.*     → arrangementsoversikt
   - jobListings.*    → stillingsannonser

CLIENT COMPONENTS (filer med "use client")
- Import:
  import { t } from "@/lib/i18n/client";
- Bruk:
  {t("profile.studyProgram")}

  Ergo: importer t fra client versjonen, og der tekst skal skrives lager vi heller et keyword som legges inn i common filene.
  deretter bruker vi keywordet slik: {t("keyword")}

SERVER COMPONENTS (default i app/)
- Import:
  import { t } from "@/lib/i18n/server";
- Bruk:
  const heading = await t("activityForm.heading");
  {heading}

I motsetning til client versjonen må vi her hente oversettelsen først og lagre den i en variabel.
deretter brukes variabelen som vanlig.

TESTER
- I Jest-tester mockes t() slik at nøkkelen returneres uendret:
  jest.mock("@/lib/i18n/client", () => ({ t: (key: string) => key }));
- Dette gjør det enkelt å assertere på kjente nøkler i stedet for oversatt tekst.

VIKTIG:
- Ikke importer "@/lib/i18n/client" i server components.
- Restart dev-server etter endring av JSON-filer.