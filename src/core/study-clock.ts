// Count running time when it is consumed, including intervals spent preparing the next question.
export class StudyClock {
  private fractionMilliseconds = 0;

  constructor(private measuredAt: number) {}

  reset(at: number, clearFraction = false) {
    this.measuredAt = at;
    if (clearFraction) this.fractionMilliseconds = 0;
  }

  collect(at: number): number {
    const elapsed = this.fractionMilliseconds + Math.max(0, at - this.measuredAt);
    const seconds = Math.floor(elapsed / 1000);
    this.measuredAt = at;
    this.fractionMilliseconds = elapsed - seconds * 1000;
    return seconds;
  }
}
