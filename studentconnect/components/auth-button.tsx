import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n/server";
import { UserMenuDropdown } from "./user-menu-dropdown";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  const signIn = await t("auth.authButton.signIn");
  const signUp = await t("auth.authButton.signUp");

  return user ? (
    <UserMenuDropdown />
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">{signIn}</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">{signUp}</Link>
      </Button>
    </div>
  );
}
