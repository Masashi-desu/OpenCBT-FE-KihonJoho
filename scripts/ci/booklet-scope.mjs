/** Stable CI/semantic-test identity. A/B and historical AM/PM stay distinct. */
export function scopeForQuestion(question) {
    if (!question || !['A', 'B'].includes(question.subject) || !Array.isArray(question.origin?.sourceRefs))
        return null;
    const scopes = new Set();
    for (const { locator } of question.origin.sourceRefs) {
        if (!locator || locator.questionNumber === undefined)
            continue;
        const sample = /^2022年(4|12)月公表 サンプル問題$/.exec(locator.period ?? '');
        if (sample && locator.subject === '科目' + question.subject && !locator.timeSlot) {
            scopes.add(`2022-${sample[1] === '4' ? 'april' : 'december'}-${question.subject.toLowerCase()}`);
            continue;
        }
        if (!Number.isSafeInteger(locator.year))
            return null;
        if (locator.timeSlot) {
            const term = { '春期': 'spring', '秋期': 'autumn', '特別': 'special', '特別試験': 'special' }[locator.period];
            const slot = { '午前': 'am', '午後': 'pm' }[locator.timeSlot];
            if (!term || !slot || question.subject !== (slot === 'am' ? 'A' : 'B'))
                return null;
            scopes.add(`${locator.year}-${term}-${slot}`);
        }
        else if (locator.year >= 2023 && locator.subject === '科目' + question.subject) {
            scopes.add(`${locator.year}-${question.subject.toLowerCase()}`);
        }
        else
            return null;
    }
    return scopes.size === 1 ? [...scopes][0] : null;
}
export function validScope(scope) {
    return typeof scope === 'string' && /^(?:20\d{2}-(?:spring|autumn|special)-(?:am|pm)|2022-(?:april|december)-[ab]|20\d{2}-[ab])$/.test(scope);
}
