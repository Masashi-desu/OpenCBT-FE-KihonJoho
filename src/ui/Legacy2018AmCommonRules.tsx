import { legacy2018AmCommonCollections } from "../core/generators/legacy-2018-am-common";
import { LegacyCommonGateTable } from "./Legacy2017AutumnAmCommonRules";
export function Legacy2018AmCommonRules({profile,values,caption}:{profile:string;values:number[];caption?:string}) {
  if (!Object.hasOwn(legacy2018AmCommonCollections,profile) || values.length!==1 || values[0]!==0)
    throw Error("AM_COMMON_PROFILE");
  return <LegacyCommonGateTable collection={legacy2018AmCommonCollections[profile as keyof typeof legacy2018AmCommonCollections]} caption={caption}/>;
}
