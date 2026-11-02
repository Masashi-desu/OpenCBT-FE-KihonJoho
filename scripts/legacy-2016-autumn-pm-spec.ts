import type { GeneratedBody } from '../src/core/generators/definition';
import type { AfternoonBookletDefinition } from '../src/core/generators/afternoon-booklet-extension-contract';

/** Private authoring input; the released catalogue contains reviewed records,
 * not this factory's data or a way to execute question-supplied code. */
export type Stage3AfternoonQuestionSpec = {
  number: number;
  title: string;
  pages: number[];
  topics: string[];
  keywords: string[];
  original: GeneratedBody;
  definition: AfternoonBookletDefinition;
  /** Complete, source-checked readable transcription for each original image. */
  originalPageAlt: Record<number, string>;
  /** Explicit code-owned context titles credited to the editor, not to IPA. */
  editorialContextTitles?: string[];
};

export { autumn2016PmPageAssetId } from '../src/core/generators/legacy-2016-autumn-pm-materials';
