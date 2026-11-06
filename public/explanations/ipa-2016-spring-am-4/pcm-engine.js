/* Managed PCM lesson model. MIT: repository LICENSE. */
(() => {
  "use strict";

  // Saved caseIndex contract for generator-source-2016h28h-fe-am-4@3.2.0.
  const conditions = [[8, 64000], [4, 16000], [4, 32000], [8, 32000]];
  const originalIntervals = [15.6, 46.8, 125, 128];
  const originalOrder = originalIntervals.map((_, index) => ({
    id: "choice-original-" + (index + 1), label: "アイウエ"[index],
  }));

  function initial(context) {
    const generation = context?.generation;
    let caseIndex = 0;
    if (generation) {
      const values = generation.parameters?.values;
      if (generation.generatorRef?.id !== "generator-source-2016h28h-fe-am-4" ||
          generation.generatorRef.version !== "3.2.0" || !Array.isArray(values) ||
          values.length !== 1 || !Number.isInteger(values[0]) || !conditions[values[0]]) {
        throw new Error("Unsupported PCM lesson parameters");
      }
      caseIndex = values[0];
    }
    const [bits, rate] = conditions[caseIndex];
    const choices = (context?.choiceOrder ?? originalOrder).map(({ id, label }) => {
      const text = generation
        ? context.question.choices.find(choice => choice.id === id)?.content.blocks
          .find(block => block.type === "paragraph")?.text
        : originalIntervals[originalOrder.findIndex(choice => choice.id === id)];
      const interval = Number(text);
      if (!Number.isFinite(interval) || interval <= 0) throw new Error("Unsupported PCM choice");
      return { id, label, interval };
    });
    return { bits, rate, choices };
  }

  function amplitude(position) {
    return 0.5 + 0.28 * Math.sin(2 * Math.PI * position + 0.15)
      + 0.13 * Math.sin(4 * Math.PI * position + 0.9);
  }

  function model(bits, rate) {
    const frequency = rate / bits;
    const intervalSeconds = 1 / frequency;
    const interval = intervalSeconds * 1e6;
    const duration = interval * 3;
    const levels = 2 ** bits;
    const samples = Array.from({ length: 3 }, (_, index) => {
      const time = index * interval;
      const position = time / duration;
      const value = amplitude(position);
      const level = Math.round(value * (levels - 1));
      return { time, position, value, level, code: level.toString(2).padStart(bits, "0") };
    });
    return { bits, rate, frequency, intervalSeconds, interval, duration, levels, samples };
  }

  function compare(model, interval) {
    const impliedRate = model.bits * 1e6 / interval;
    const matches = interval === model.interval;
    const positions = Array.from({ length: Math.ceil(model.duration / interval) },
      (_, index) => index * interval / model.duration);
    return { impliedRate, matches, positions };
  }

  window.PcmEngine = Object.freeze({ initial, amplitude, model, compare });
})();
