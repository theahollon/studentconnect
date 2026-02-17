import { requireAdmin } from "@/lib/auth";
import ActivityForm from "./ActivityForm"; 

export default async function Page() {
  await requireAdmin(); // 🔒 Only admins can access this page
  return <ActivityForm />;
}
