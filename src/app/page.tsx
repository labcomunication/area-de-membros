import { redirect } from "next/navigation";
import { readVerifiedSession } from "@/server/session";
export default async function Page() {
  redirect((await readVerifiedSession()) ? "/area" : "/entrar");
}
