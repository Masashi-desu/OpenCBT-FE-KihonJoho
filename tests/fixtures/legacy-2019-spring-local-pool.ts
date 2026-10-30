import{legacy2019AfternoonAuthDefinitions}from'../../src/core/generators/legacy-2019-pm-auth';
import{legacy2019AfternoonMemoryDefinitions}from'../../src/core/generators/legacy-2019-pm-memory';
import{legacy2019AfternoonDatabaseDefinitions}from'../../src/core/generators/legacy-2019-pm-database';
import{legacy2019AfternoonLoadBalanceDefinitions}from'../../src/core/generators/legacy-2019-pm-load-balance';
import{legacy2019AfternoonInspectionDefinitions}from'../../src/core/generators/legacy-2019-pm-inspection';
import{legacy2019AfternoonChangeDefinitions}from'../../src/core/generators/legacy-2019-pm-change';
import{legacy2019AfternoonIntegrationDefinitions}from'../../src/core/generators/legacy-2019-pm-integration';
import{legacy2019AfternoonHuffmanDefinitions}from'../../src/core/generators/legacy-2019-pm-huffman';
import{legacy2019RankingDefinitions}from'../../src/core/generators/legacy-2019-pm-ranking';
/** Source-local nine actual definitions. Annual143/144/14 membership is a separate F historical boundary. */
export const legacy2019SourceLocalExistingDefinitions=async()=>[...legacy2019AfternoonAuthDefinitions,...legacy2019AfternoonMemoryDefinitions,...legacy2019AfternoonDatabaseDefinitions,...legacy2019AfternoonLoadBalanceDefinitions,...legacy2019AfternoonInspectionDefinitions,...legacy2019AfternoonChangeDefinitions,...legacy2019AfternoonIntegrationDefinitions,...legacy2019AfternoonHuffmanDefinitions,...legacy2019RankingDefinitions];

// Historical test import name only: this returns the nine source-local private definitions, never an annual pool.
export {legacy2019SourceLocalExistingDefinitions as legacy2019ReviewedAnnualDefinitions};
