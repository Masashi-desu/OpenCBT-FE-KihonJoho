/* Managed seven-segment LED lesson. MIT: repository LICENSE. */
(() => {
  "use strict";
  const labels = Object.freeze(["a", "b", "c", "d", "e", "f", "g", "Dt"]);
  const lastStep = 11;
  const originalByte = 0x92;
  // Saved caseIndex (generator-source-2016h28a-fe-am-21@3.2.0) to output byte.
  const caseBytes = [0x92, 0x24, 0x80, 0x40, 0x82, 0x10, 0xB0, 0x79];
  // Read directly from the four original drawings (asset-only choices).
  const originalMasks = [207, 102, 109, 253];
  const originalChoices = originalMasks.map((mask, i) => ({
    id: "choice-original-" + (i + 1), label: "アイウエ"[i], mask,
  }));
  const isByte = value => Number.isInteger(value) && value >= 0 && value < 256;
  const hex = value => value.toString(16).toUpperCase().padStart(2, "0");
  function parseHex(text) {
    const normalized = text.replace(/[０-９Ａ-Ｆａ-ｆ]/g, char => String.fromCharCode(char.charCodeAt(0) - 0xFEE0));
    return /^[0-9A-Fa-f]{2}$/.test(normalized) ? Number.parseInt(normalized, 16) : null;
  }
  function initial(context) {
    const gen = context?.generation;
    if (!gen) return originalByte;
    const values = gen.parameters?.values;
    if (gen.generatorRef?.id !== "generator-source-2016h28a-fe-am-21" ||
        gen.generatorRef.version !== "3.2.0" || !Array.isArray(values) || values.length !== 1 ||
        !Number.isInteger(values[0]) || values[0] < 0 || values[0] >= caseBytes.length) {
      throw new Error("Unsupported LED lesson parameters");
    }
    return caseBytes[values[0]];
  }
  function choices(context) {
    if (!context) return originalChoices.map(choice => ({ ...choice }));
    return context.choiceOrder.map(({ id, label }) => {
      const mask = context.generation
        ? context.question.choices.find(choice => choice.id === id)?.content.blocks
          .find(block => block.type === "diagram" && block.scene?.profile === "legacy-2016-autumn-am-21-led")?.scene.values[0]
        : originalChoices.find(choice => choice.id === id)?.mask;
      if (!isByte(mask)) throw new Error("Unsupported LED choice");
      return { id, label, mask };
    });
  }
  function snapshot(byte, step) {
    if (!isByte(byte) || !Number.isInteger(step) || step < 0 || step > lastStep) throw new RangeError("Invalid LED step");
    const bits = byte.toString(2).padStart(8, "0");
    const ports = [...bits].map((bit, index) => ({
      number: 7 - index, segment: labels[7 - index], bit: Number(bit),
      converted: step >= (index < 4 ? 1 : 2),
      current: step === index + 3,
      on: step >= index + 3 ? bit === "0" : null,
    }));
    return { byte, step, bits, ports, active: ports.find(port => port.current), mask: 255 ^ byte };
  }
  function differences(mask, choiceMask) {
    return labels.filter((_, i) => Boolean((mask ^ choiceMask) & (1 << i)));
  }
  window.LedEngine = Object.freeze({ labels, lastStep, hex, parseHex, initial, choices, snapshot, differences });
})();
