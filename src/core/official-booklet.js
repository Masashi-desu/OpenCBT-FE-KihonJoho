/** Fixed editions occupy an official booklet position. Generated bases and
 * issued variants retain a reference to a separate fixed edition.
 * @param {Pick<import("./types").Question, "origin">} question
 */
export function isOfficialBookletQuestion(question) {
  const origin = question.origin;
  return origin.kind === "official_reprint" ||
    (origin.kind === "official_adaptation" && origin.derivedFrom?.length === 0 &&
      origin.isModified && origin.modificationBasis === "official_source");
}
