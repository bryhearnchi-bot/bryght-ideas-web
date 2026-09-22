import "./orbit.css";
import { OrbitStage } from "./orbit-stage";
import { OrbitSections } from "./orbit-sections";
import { VersionSwitcher } from "./version-switcher";

export function OrbitPage() {
  return (
    <main className="o2-root">
      <OrbitStage />
      <OrbitSections />
      <VersionSwitcher current="/v2" />
    </main>
  );
}
