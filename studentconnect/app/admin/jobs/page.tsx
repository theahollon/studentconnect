import { requireAdmin } from "@/lib/auth";
import JobAdForm from "./JobAdForm";

export default async function Page() {
  await requireAdmin(); // 🔒 Only admins can access this page
  return <JobAdForm />;
}