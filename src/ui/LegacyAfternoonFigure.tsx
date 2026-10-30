import spring2019FigureProfiles from "../core/generators/legacy-2019-spring-profiles.json";
import { Legacy2019SpringAfternoonFigure } from "./Legacy2019SpringAfternoonFigure";
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
import { Legacy2017AutumnPm1Figure } from "./Legacy2017AutumnPm1Figure";
import { Legacy2017AutumnPm2Figure } from "./Legacy2017AutumnPm2Figure";
import { Legacy2017AutumnPm3Figure } from "./Legacy2017AutumnPm3Figure";
import { Legacy2017AutumnPm4Figure } from "./Legacy2017AutumnPm4Figure";
import { Legacy2017AutumnPm5Figure } from "./Legacy2017AutumnPm5Figure";
import { Legacy2017AutumnPm6Figure } from "./Legacy2017AutumnPm6Figure";
import { Legacy2017AutumnPm7Figure } from "./Legacy2017AutumnPm7Figure";
import { Legacy2017AutumnPm8Figure } from "./Legacy2017AutumnPm8Figure";
import { Legacy2017AutumnPm9Figure } from "./Legacy2017AutumnPm9Figure";
import { Legacy2017AutumnPm10Figure } from "./Legacy2017AutumnPm10Figure";
import { Legacy2017AutumnPm11Figure } from "./Legacy2017AutumnPm11Figure";
import { Legacy2017AutumnPm12Figure } from "./Legacy2017AutumnPm12Figure";
import { Legacy2017AutumnPm13Figure } from "./Legacy2017AutumnPm13Figure";

import { Legacy2018SpringPm1Figure } from "./Legacy2018SpringPm1Figure";
import { Legacy2018SpringPm2Figure } from "./Legacy2018SpringPm2Figure";
import { Legacy2018SpringPm3Figure } from "./Legacy2018SpringPm3Figure";
import { Legacy2018SpringPm4Figure } from "./Legacy2018SpringPm4Figure";
import { Legacy2018SpringPm5Figure } from "./Legacy2018SpringPm5Figure";
import { Legacy2018SpringPm6Figure } from "./Legacy2018SpringPm6Figure";
import { Legacy2018SpringPm7Figure } from "./Legacy2018SpringPm7Figure";
import { Legacy2018SpringPm8Figure } from "./Legacy2018SpringPm8Figure";
import { Legacy2018SpringPm9Figure } from "./Legacy2018SpringPm9Figure";
import { Legacy2018SpringPm10Figure } from "./Legacy2018SpringPm10Figure";
import { Legacy2018SpringPm11Figure } from "./Legacy2018SpringPm11Figure";
import { Legacy2018SpringPm12Figure } from "./Legacy2018SpringPm12Figure";
import { Legacy2018SpringPm13Figure } from "./Legacy2018SpringPm13Figure";

import { Legacy2018AutumnPm2Figure } from "./Legacy2018AutumnPm2Figure";
import { Legacy2018AutumnPm3Figure } from "./Legacy2018AutumnPm3Figure";
import { Legacy2018AutumnPm4Figure } from "./Legacy2018AutumnPm4Figure";
import { Legacy2018AutumnPm5Figure } from "./Legacy2018AutumnPm5Figure";
import { Legacy2018AutumnPm6Figure } from "./Legacy2018AutumnPm6Figure";
import { Legacy2018AutumnPm7Figure } from "./Legacy2018AutumnPm7Figure";
import { Legacy2018AutumnPm13Figure } from "./Legacy2018AutumnPm13Figure";
import { Legacy2018AutumnLanguageFigure } from "./Legacy2018AutumnLanguageFigure";
import { Legacy2018AutumnExistingBank } from "./Legacy2018AutumnExistingBank";
import { Legacy2018AutumnExpressionFigure } from "./Legacy2018AutumnExpressionFigure";
import { Legacy2018SecurityText } from "./Legacy2018SecurityText";
import { Legacy2018SecurityTable } from "./Legacy2018SecurityTable";

const spring2018Figures = [Legacy2018SpringPm1Figure, Legacy2018SpringPm2Figure, Legacy2018SpringPm3Figure, Legacy2018SpringPm4Figure, Legacy2018SpringPm5Figure, Legacy2018SpringPm6Figure, Legacy2018SpringPm7Figure, Legacy2018SpringPm8Figure, Legacy2018SpringPm9Figure, Legacy2018SpringPm10Figure, Legacy2018SpringPm11Figure, Legacy2018SpringPm12Figure, Legacy2018SpringPm13Figure];

const autumnFigures = [Legacy2017AutumnPm1Figure, Legacy2017AutumnPm2Figure, Legacy2017AutumnPm3Figure,
  Legacy2017AutumnPm4Figure, Legacy2017AutumnPm5Figure, Legacy2017AutumnPm6Figure, Legacy2017AutumnPm7Figure,
  Legacy2017AutumnPm8Figure, Legacy2017AutumnPm9Figure, Legacy2017AutumnPm10Figure, Legacy2017AutumnPm11Figure,
  Legacy2017AutumnPm12Figure, Legacy2017AutumnPm13Figure];

export function LegacyAfternoonFigure({ profile, values, caption }: { profile: string; values: number[]; caption: string }) {
  if (readLegacyAfternoonFigure(profile, values).caption !== caption)
    throw new DataError("SOURCE_MATERIAL", "旧午後の図の見出しが一致しません。");
  if (spring2019FigureProfiles.includes(profile)) return <Legacy2019SpringAfternoonFigure {...{ profile, values, caption }} />;
  if (profile === "legacy-2018-security-mandatory-notice" || profile === "legacy-2018-security-attack-evidence")
    return <Legacy2018SecurityText {...{ profile, values, caption }} />;
  if (profile === "legacy-2018-security-measure-table") return <Legacy2018SecurityTable {...{ profile, values, caption }} />;
  if (profile === "legacy-2018-autumn-pm1-bank" || profile === "legacy-2018-autumn-pm8-bank")
    return <Legacy2018AutumnExistingBank {...{ profile, values, caption }} />;
  if (profile.startsWith("legacy-2018-autumn-pm8-expression-"))
    return <Legacy2018AutumnExpressionFigure {...{ profile, values, caption }} />;
  const autumn2018 = /^legacy-2018-autumn-pm(\d+)-/.exec(profile);
  if (autumn2018) {
    const number = Number(autumn2018[1]);
    if (number >= 9 && number <= 12) return <Legacy2018AutumnLanguageFigure {...{ profile, values }} />;
    const Figure = ({ 2: Legacy2018AutumnPm2Figure, 3: Legacy2018AutumnPm3Figure, 4: Legacy2018AutumnPm4Figure,
      5: Legacy2018AutumnPm5Figure, 6: Legacy2018AutumnPm6Figure, 7: Legacy2018AutumnPm7Figure,
      13: Legacy2018AutumnPm13Figure } as Record<number, typeof Legacy2018AutumnPm2Figure>)[number];
    if (Figure) return <Figure {...{ profile, values, caption }} />;
  }
  const autumn = /^legacy-2017-autumn-pm(\d+)-/.exec(profile);
  if (autumn) {
    const Figure = autumnFigures[Number(autumn[1]) - 1];
    if (Figure) return <Figure {...{ profile, values, caption }} />;
  }
  const spring2018 = /^legacy-2018-spring-pm(\d+)-/.exec(profile);
  const number2018 = spring2018 ? Number(spring2018[1]) :
    profile.startsWith("legacy-2018-health-") ? 5 :
    profile.startsWith("legacy-2018-evm-") ? 6 :
    profile === "legacy-2018-profit-table" || profile === "legacy-2018-cost-curves" ? 7 :
    profile.startsWith("legacy-2018-heap-") ? 8 : undefined;
  if (number2018 !== undefined) {
    const Figure = spring2018Figures[number2018 - 1];
    if (Figure) return <Figure {...{ profile, values, caption }} />;
  }
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
