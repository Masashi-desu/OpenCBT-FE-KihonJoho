import{legacy2019PmAuthStudyTerms,legacy2019PmAuthRelatedTerms}from'../../src/core/generators/legacy-2019-pm-auth-study-terms';
import{legacy2019InspectionStudyTerms,legacy2019InspectionRelatedTerms}from'../../src/core/generators/legacy-2019-pm-inspection-study-terms';
import{legacy2019PmChangeStudyTerms,legacy2019PmChangeRelatedTerms}from'../../src/core/generators/legacy-2019-pm-change-study-terms';
import{legacy2019PmIntegrationStudyTerms,legacy2019PmIntegrationRelatedTerms}from'../../src/core/generators/legacy-2019-pm-integration-study-terms';
import{legacy2019Pm8StudyTerms,legacy2019Pm8RelatedTerms}from'../../src/core/generators/legacy-2019-pm8-study-terms';
import{legacy2019RankingStudyTerms,legacy2019RankingRelatedTerms}from'../../src/core/generators/legacy-2019-pm-ranking-study-terms';
import{legacy2019PmAuthInheritedTerms}from'../../src/core/generators/legacy-2019-pm-auth-study-terms';
/** Only the six existing source-local term modules read by these tests. No annual AM/autumn collection. */
export const legacy2019StudyTerms=[...legacy2019PmAuthStudyTerms,...legacy2019InspectionStudyTerms,...legacy2019PmChangeStudyTerms,...legacy2019PmIntegrationStudyTerms,...legacy2019Pm8StudyTerms,...legacy2019RankingStudyTerms];
export const legacy2019InheritedStudyTerms=legacy2019PmAuthInheritedTerms;
export const legacy2019RelatedTermsBySource:Record<string,string[]>={...legacy2019PmAuthRelatedTerms,...legacy2019InspectionRelatedTerms,...legacy2019PmChangeRelatedTerms,...legacy2019PmIntegrationRelatedTerms,...legacy2019Pm8RelatedTerms,...legacy2019RankingRelatedTerms};
