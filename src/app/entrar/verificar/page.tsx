import { AccessScreen } from "@/components/access-screens";
// TODO: consume only a verified, one-use token after the real auth adapter exists.
export default function Page() {
  return <AccessScreen kind="verify" />;
}
