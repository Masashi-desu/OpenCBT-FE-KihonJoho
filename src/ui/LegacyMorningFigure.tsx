import type {ComponentType} from "react";
import {DataError} from "../core/errors";
import {legacyMorningFigureAlt} from "../core/legacy-morning-figures";
import {Legacy2017AutumnBusinessFigure} from "./Legacy2017AutumnBusinessFigures";
import {Legacy2017AutumnPlanningFigure} from "./Legacy2017AutumnPlanningFigures";
import {Legacy2017AutumnQualityFigure} from "./Legacy2017AutumnQualityFigures";
import {Legacy2017AutumnSecurityFigure} from "./Legacy2017AutumnSecurityFigures";
import {Legacy2017AutumnDataFigure} from "./Legacy2017AutumnDataFigures";
import {Legacy2017AutumnPlatformFigure} from "./Legacy2017AutumnPlatformFigures";
import {Legacy2017AutumnFoundationsFigure} from "./Legacy2017AutumnFoundationsFigures";
import {Legacy2017BusinessFigure} from "./Legacy2017BusinessFigures";
import {Legacy2017DevelopmentFigure} from "./Legacy2017DevelopmentFigures";
import {Legacy2017SystemsFigure} from "./Legacy2017SystemsFigures";
import {Legacy2017Figure} from "./Legacy2017Figures";
import {Legacy2017StrategyFigure} from "./Legacy2017StrategyFigures";
import {Legacy2017ComputingFigure} from "./Legacy2017ComputingFigures";
import {Legacy2018DevelopmentFigure} from "./Legacy2018DevelopmentFigures";
import {Legacy2018StrategyFigure} from "./Legacy2018StrategyFigures";
import {Legacy2018TechnicalFigure} from "./Legacy2018TechnicalFigures";
import {Legacy2018TechnicalCircuitFigure} from "./Legacy2018TechnicalCircuitFigures";
import {Legacy2018TechnicalScheduleFigure} from "./Legacy2018TechnicalScheduleFigures";
import {Legacy2018AutumnFoundationsFigure} from "./Legacy2018AutumnFoundationsFigures";
import {Legacy2018AutumnSystemsFigure} from "./Legacy2018AutumnSystemsFigures";
import {Legacy2018AutumnDevelopmentFigure} from "./Legacy2018AutumnDevelopmentFigures";
import {Legacy2019AutumnNetworkFigure} from "./Legacy2019AutumnNetworkFigures";
import {Legacy2019AutumnStructuresFigure} from "./Legacy2019AutumnStructuresFigures";
import {Legacy2019AutumnComputingFigure} from "./Legacy2019AutumnComputingFigures";
import {Legacy2019MorningFigure} from "./Legacy2019MorningFigures";
import {Legacy2018PendingAmFigures} from "./Legacy2018PendingAmFigures";
import {Legacy2017AutumnAmCommonRules} from "./Legacy2017AutumnAmCommonRules";
import {Legacy2018AmCommonRules} from "./Legacy2018AmCommonRules";
import {Legacy2019AutumnAmCommonRules} from "./Legacy2019AutumnAmCommonRules";

import {Legacy2017AutumnAmUsbFigure} from "./Legacy2017AutumnAmUsbFigure";
import {Legacy2019SpringCauseEffectFigure} from "./Legacy2019SpringCauseEffectFigure";
type Props={profile:string;values:number[];caption:string};
const renderers:Record<string,ComponentType<Props>>={
  "legacy-2017-usb-plug-cross-sections": Legacy2017AutumnAmUsbFigure,
  "legacy-2019-spring-cause-effect": Legacy2019SpringCauseEffectFigure,
  "legacy-2017-autumn-am-common-gates": Legacy2017AutumnAmCommonRules,
  "legacy-2018-spring-am-common-gates": Legacy2018AmCommonRules,
  "legacy-2018-autumn-am-common-gates": Legacy2018AmCommonRules,
  "legacy-2019-autumn-am-common-gates": Legacy2019AutumnAmCommonRules,
  "legacy-2017-employment-contracts": Legacy2017AutumnBusinessFigure,
  "legacy-2017-sales-time-analysis": Legacy2017AutumnPlanningFigure,
  "legacy-2017-project-critical-path": Legacy2017AutumnQualityFigure,
  "legacy-2017-database-transport": Legacy2017AutumnSecurityFigure,
  "legacy-2017-logic-six-gates": Legacy2017AutumnDataFigure,
  "legacy-2017-uml-departments": Legacy2017AutumnDataFigure,
  "legacy-2017-memory-compaction": Legacy2017AutumnPlatformFigure,
  "legacy-2017-line-following-car": Legacy2017AutumnFoundationsFigure,
  "legacy-2017-affiliate-workflow": Legacy2017BusinessFigure,
  "legacy-2017-coverage-two-decisions": Legacy2017DevelopmentFigure,
  "legacy-2017-cumulative-bug-curve": Legacy2017DevelopmentFigure,
  "legacy-2017-multiplication-flow": Legacy2017SystemsFigure,
  "legacy-2017-half-adder": Legacy2017SystemsFigure,
  "legacy-2017-functional-dependencies": Legacy2017SystemsFigure,
  "legacy-2017-accounting-model": Legacy2017SystemsFigure,
  "legacy-2017-ftth-home-network": Legacy2017SystemsFigure,
  "legacy-2017-development-cost-table": Legacy2017Figure,
  "legacy-2017-mrp-flow": Legacy2017StrategyFigure,
  "legacy-2017-four-device-availability": Legacy2017ComputingFigure,
  "legacy-2017-directory-tree": Legacy2017ComputingFigure,
  "legacy-2017-page-replacement-choices": Legacy2017ComputingFigure,
  "legacy-2018-coverage-flow": Legacy2018DevelopmentFigure,
  "legacy-2018-shorten-network": Legacy2018DevelopmentFigure,
  "legacy-2018-dispatch-relations": Legacy2018StrategyFigure,
  "legacy-2018-shortest-grid": Legacy2018TechnicalFigure,
  "legacy-2018-stack-state": Legacy2018TechnicalFigure,
  "legacy-2018-array-list": Legacy2018TechnicalFigure,
  "legacy-2018-instruction-fetch": Legacy2018TechnicalFigure,
  "legacy-2018-majority-truth-table": Legacy2018TechnicalCircuitFigure,
  "legacy-2018-majority-circuit": Legacy2018TechnicalCircuitFigure,
  "legacy-2018-priority-chart": Legacy2018TechnicalScheduleFigure,
  "legacy-2018-autumn-network": Legacy2018AutumnFoundationsFigure,
  "legacy-2018-autumn-nand-circuit": Legacy2018AutumnSystemsFigure,
  "legacy-2018-autumn-membership-history": Legacy2018AutumnSystemsFigure,
  "legacy-2018-autumn-project-network": Legacy2018AutumnDevelopmentFigure,
  "legacy-2019-two-phase-locking": Legacy2019AutumnNetworkFigure,
  "legacy-2019-home-network": Legacy2019AutumnNetworkFigure,
  "legacy-2019-adjacency-matrix": Legacy2019AutumnStructuresFigure,
  "legacy-2019-adjacency-graph": Legacy2019AutumnStructuresFigure,
  "legacy-2019-density-plot": Legacy2019AutumnStructuresFigure,
  "legacy-2019-bnf-rules": Legacy2019AutumnStructuresFigure,
  "legacy-2019-dfd-symbols": Legacy2019AutumnStructuresFigure,
  "legacy-2019-critical-network": Legacy2019AutumnStructuresFigure,
  "legacy-2019-interrupt-timing": Legacy2019AutumnComputingFigure,
  "legacy-2019-serial-wave": Legacy2019AutumnComputingFigure,
  "legacy-2019-composed-logic": Legacy2019AutumnComputingFigure,
  "legacy-2019-truth-table": Legacy2019AutumnComputingFigure,
  "legacy-2019-score-relation": Legacy2019AutumnComputingFigure,
  "legacy-2019-two-input-box": Legacy2019MorningFigure,
  "legacy-2019-data-feedback": Legacy2019MorningFigure,
  "legacy-2019-bst": Legacy2019MorningFigure,
  "legacy-2019-gcd-flow": Legacy2019MorningFigure,
  "legacy-2019-database-diagnosis": Legacy2019MorningFigure,
};
export const legacyMorningRendererProfiles=[...Object.keys(renderers),"legacy-2018-autumn-procurement-flow", "legacy-2018-autumn-customer-migration-table"];

/** Only managed, source-reviewed AM renderers enter this dispatch. */
export function LegacyMorningFigure(props:Props){
  const alt=legacyMorningFigureAlt(props.profile,props.values);
  const Figure=Object.hasOwn(renderers,props.profile)?renderers[props.profile]:undefined;
  if(Figure)return <Figure {...props}/>;
  if(props.profile==="legacy-2018-autumn-procurement-flow" || props.profile==="legacy-2018-autumn-customer-migration-table")return <div className="managed-diagram source-figure" role="group" aria-label={props.caption} aria-description={alt}><div className="diagram-scroll" tabIndex={0} aria-label="問題の図表。幅が足りない場合は左右にスクロールできます。"><Legacy2018PendingAmFigures profile={props.profile} values={props.values}/></div></div>;
  throw new DataError("FIGURE_PROFILE","旧午前の描画器が未登録です");
}
