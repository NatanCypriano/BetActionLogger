import { Redirect } from "expo-router";

export default function ManagerActionTypesRoute() {
  return <Redirect href={"/settings" as never} />;
}
