import { DataError } from '../errors';
import { field, variableNotes, type GeneratedBody, type GenerationDefinition } from './definition';
import { legacy2013AutumnAm27To53Source as source } from './legacy-2013-autumn-am-27-53-source';

export function finite2013AutumnAm(number: number, title: string, input: string, count: number, notes: string,
  build: (index: number) => GeneratedBody): GenerationDefinition {
  return {
    source: '2013h25a-fe-am-' + number,
    title,
    fields: [field(input, 0, count - 1)],
    reference: [0],
    sourceAnswer: source[number].key,
    version: '3.7.0',
    notes: variableNotes + ' ' + notes,
    build(values) {
      const [index] = values;
      if (values.length !== 1 || !Number.isSafeInteger(index) || index < 0 || index >= count)
        throw new DataError('PARAMETER_CONSTRAINT', '指定条件が候補の範囲外です。');
      return build(index);
    },
  };
}
