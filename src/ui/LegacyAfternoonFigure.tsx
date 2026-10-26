import { readLegacyAfternoonFigure } from "../core/legacy-afternoon-figures";
import { DataError } from "../core/errors";
import { Legacy2017Pm2Figure } from "./Legacy2017Pm2Figures";
import { Legacy2017Pm4Figure } from "./Legacy2017Pm4Figure";
import { Legacy2017Pm5Figure } from "./Legacy2017Pm5Figure";
import { Legacy2017Pm6Document } from "./Legacy2017Pm6Document";
import { Legacy2017Pm7Figure } from "./Legacy2017Pm7Figure";
import { Legacy2017Pm8Figure } from "./Legacy2017Pm8Figures";
import { Legacy2017Pm9Figure } from "./Legacy2017Pm9Figure";
import { Legacy2017Pm10Figure } from "./Legacy2017Pm10Figure";
import { Legacy2017Pm11Figure } from "./Legacy2017Pm11Figure";
import { Legacy2017Pm12Figure } from "./Legacy2017Pm12Figure";
import { Legacy2017Pm13Figure } from "./Legacy2017Pm13Figure";

export function LegacyAfternoonFigure({ profile, values, caption }: { profile: string; values: number[]; caption: string }) {
  if (readLegacyAfternoonFigure(profile, values).caption !== caption)
    throw new DataError("SOURCE_MATERIAL", "旧午後の図の見出しが一致しません。");
  if (profile === "legacy-2017-pm2-temperature-monitor") return <Legacy2017Pm2Figure {...{ profile, values, caption }} />;
  if (profile === "legacy-2017-pm4-wireless-timing") return <Legacy2017Pm4Figure {...{ profile, values, caption }} />;
  if (profile.startsWith("legacy-2017-pm5-")) return <Legacy2017Pm5Figure {...{ profile, values, caption }} />;
  if (profile === "legacy-2017-pm6-unit") return <Legacy2017Pm6Document {...{ profile, values }} />;
  if (profile === "legacy-2017-pm7-inventory") return <Legacy2017Pm7Figure {...{ profile, values }} />;
  if (profile.startsWith("legacy-2017-pm8-")) return <Legacy2017Pm8Figure {...{ profile, values, caption }} />;
  if (profile.startsWith("legacy-2017-pm9-")) return <Legacy2017Pm9Figure {...{ profile, values }} />;
  if (profile.startsWith("legacy-2017-pm10-")) return <Legacy2017Pm10Figure {...{ profile, values }} />;
  if (profile.startsWith("legacy-2017-pm11-")) return <Legacy2017Pm11Figure {...{ profile, values }} />;
  if (profile.startsWith("legacy-2017-pm12-")) return <Legacy2017Pm12Figure {...{ profile, values }} />;
  if (profile.startsWith("legacy-2017-pm13-")) return <Legacy2017Pm13Figure {...{ profile, values }} />;
  throw new DataError("FIGURE_PROFILE", "旧午後の描画器が登録されていません。");
}
