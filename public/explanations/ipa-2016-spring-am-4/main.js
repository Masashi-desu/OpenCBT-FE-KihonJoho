/* Managed PCM lesson. MIT: repository LICENSE. */
(() => {
  "use strict";
  const engine = window.PcmEngine, api = window.OpenCBTDetail;
  const $ = id => document.getElementById(id);
  const { bits, rate, choices } = engine.initial(api?.context);
  const model = engine.model(bits, rate);
  const { frequency, intervalSeconds, interval, levels, samples } = model;
  const lastStep = 6;
  const integer = new Intl.NumberFormat("ja-JP");
  const decimal = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 2 });
  const y = value => 94 - 88 * value;
  const amplitudeText = sample => `約${sample.value.toFixed(3)}`;
  const bitsText = `${bits}ビット`;
  const rateText = integer.format(rate);
  const frequencyText = integer.format(frequency);
  const secondsText = `${intervalSeconds} 秒`;
  const intervalText = `${interval} μs`;
  let step = 0, selected = null, compared = null;

  if (api) {
    document.documentElement.dataset.theme = api.context.theme;
    api.onThemeChange(theme => { document.documentElement.dataset.theme = theme; });
    api.setPresentation("pcm");
  } else {
    $("standalone-title").hidden = $("standalone-credit").hidden = false;
    window.OpenCBTPcmScrollbars?.installOverlayScrollbars(document);
  }

  $("scenario-bits").textContent = bitsText;
  $("bit-count").textContent = bitsText;
  $("scenario-rate").textContent = `${rateText} ビット／秒`;
  $("bit-rate").textContent = rateText;
  $("wave").setAttribute("d", Array.from({ length: 201 }, (_, i) =>
    `${i ? "L" : "M"}${i / 2} ${y(engine.amplitude(i / 200)).toFixed(2)}`).join(" "));
  const guides = positions => positions.map(position =>
    `M${position * 100} ${y(engine.amplitude(position))}V94`).join(" ");
  const samplingGuides = guides(samples.map(sample => sample.position));
  const sampleButtons = samples.map((sample, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sample";
    button.style.setProperty("--sample-x", `${sample.position * 100}%`);
    button.style.setProperty("--sample-y", `${y(sample.value)}%`);
    button.setAttribute("aria-label", `標本${index + 1}`);
    const label = document.createElement("span");
    label.textContent = index + 1;
    button.append(label);
    button.addEventListener("click", () => {
      selected = selected === index ? null : index;
      compared = null;
      draw();
    });
    $("samples").append(button);
    return button;
  });
  const choiceButtons = choices.map(({ label, interval }, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${label} ${interval}`;
    button.setAttribute("aria-label", `選択肢${label}、${interval}マイクロ秒`);
    button.addEventListener("click", () => {
      compared = compared === index ? null : index;
      selected = null;
      draw();
    });
    $("choices").append(button);
    return button;
  });

  function term(kind, value) {
    const span = document.createElement("span");
    span.className = "term";
    span.dataset.value = kind;
    span.textContent = value;
    return span;
  }

  function sampleExplanation(index) {
    const sample = samples[index];
    const time = index === 0 ? ["0 μs"] : [index === 2 ? "2 × " : "", term("interval", "Δt")];
    if (step >= 6 && index) time.push(" ＝ ", term("interval", `${sample.time} μs`));
    return [`標本${index + 1}の時刻と振幅`,
      ["時刻 ", ...time, " → 振幅 ", term("amplitude", amplitudeText(sample))],
      "縦線と波形が交わる位置で振幅を読み取ります。隣り合う縦線の時間差が標本間隔 Δt です。"];
  }

  function explain(index, candidate) {
    const sample = samples[index];
    if (candidate) {
      const choice = choices[compared];
      const calculated = decimal.format(candidate.impliedRate);
      const equals = Number(calculated.replaceAll(",", "")) === candidate.impliedRate ? "＝" : "≈";
      return [`選択肢${choice.label}の間隔で標本化`,
        [term("bits", bits), " × (1,000,000 ÷ ", term("candidate", choice.interval), `) ${equals} ${calculated} ビット／秒`],
        `破線が候補の標本時刻です。標本間隔 ${choice.interval} μs から計算した転送速度は、問題の ${rateText} ビット／秒と${candidate.matches ? "一致します" : "一致しません"}。`];
    }
    if (selected !== null && (step === 1 || step >= 4)) return sampleExplanation(index);
    switch (step) {
      case 0:
        return ["連続した音声波形", [], "PCM（Pulse Code Modulation、パルス符号変調）では、波形を等間隔に読み取ります。「次へ」で、例示の波形に標本点を置きます。"];
      case 1:
        return ["一定の時間間隔で標本化", ["0 → ", term("interval", "Δt"), " → 2 × ", term("interval", "Δt")],
          "縦線と波形が交わる3点が標本です。点を押すと、その時刻と振幅を確認できます。"];
      case 2:
        return [`振幅を段階に丸める（標本${index + 1}）`,
          [term("amplitude", amplitudeText(sample)), ` × (${levels} − 1) を丸める → `, sample.level],
          `${bits}ビットで区別できる段階は 2^${bits} ＝ ${levels} 通りです。この例では、振幅を0〜${levels - 1}の段階番号の尺度に変換して、最も近い整数に丸めます。`];
      case 3:
        return [`段階番号を符号化（標本${index + 1}）`,
          [term("level", sample.level), `（十進） → ${sample.code}（`, term("bits", bitsText), "）"],
          `段階番号を2進数に直し、必要に応じて先頭に0を補います。どの標本も ${bits} ビットです。`];
      case 4:
        return ["1秒に送る標本数を求める",
          [term("rate", rateText), " ビット／秒 ÷ ", term("bits", bits), ` ビット／標本 ＝ ${frequencyText} 標本／秒`],
          "圧縮せずにリアルタイムで送るので、1秒分のビット数を1標本分のビット数で割ると、1秒間の標本数が分かります。"];
      case 5:
        return ["標本間隔を秒で求める", [term("interval", "Δt"), ` ＝ 1秒 ÷ ${frequencyText} ＝ `, term("interval", secondsText)],
          "1秒に等間隔で並ぶ標本の個数で1秒を割ると、時間軸の括弧で示した1間隔の長さになります。"];
      case 6: {
        const matching = choices.find(choice => choice.interval === interval);
        return ["マイクロ秒に換算する", [term("interval", "Δt"), " ＝ ", term("interval", intervalSeconds), " × 1,000,000 ＝ ", term("interval", intervalText)],
          `1秒は1,000,000マイクロ秒です。${matching ? `選択肢${matching.label}の ${interval} μs と一致します。` : ""}候補を押すと、同じ波形で標本間隔と転送速度を比べられます。`];
      }
    }
  }

  function draw() {
    const candidate = compared === null ? null : engine.compare(model, choices[compared].interval);
    const index = selected ?? 1, sample = samples[index];
    const sampleKind = step === 3 ? "level" : "amplitude";
    const showSample = selected !== null || step === 2 || step === 3;
    const diagram = $("diagram");
    diagram.dataset.sampling = String(step >= 1);
    diagram.dataset.interval = String(step >= 5 && selected === null && !candidate);
    const calculatingFrequency = step === 4 && selected === null;
    $("condition-bits").dataset.active = String(step === 3 || calculatingFrequency || Boolean(candidate));
    $("condition-rate").dataset.active = String(calculatingFrequency);
    $("guides").setAttribute("d", step >= 1 ? samplingGuides : "");
    $("candidate-guides").setAttribute("d", candidate ? guides(candidate.positions) : "");
    $("samples").hidden = step === 0;
    sampleButtons.forEach((button, number) => {
      button.setAttribute("aria-pressed", String(number === selected));
      button.dataset.inFormula = String(showSample && number === index);
      button.dataset.value = showSample && number === index ? sampleKind : "";
    });
    const sampleValue = $("sample-value");
    sampleValue.hidden = !showSample;
    sampleValue.dataset.value = sampleKind;
    sampleValue.dataset.atOrigin = String(index === 0);
    sampleValue.style.setProperty("--sample-x", `${sample.position * 100}%`);
    sampleValue.style.setProperty("--sample-y", `${y(sample.value)}%`);
    sampleValue.textContent = step === 3 ? `段階 ${sample.level}` : `振幅 ${amplitudeText(sample)}`;
    const guideX = sample.position * 100;
    $("amplitude-guide").setAttribute("d", showSample && sampleKind === "amplitude"
      ? `M0 ${y(sample.value)}H${guideX || 12}`
      : "");

    const intervalLink = $("interval-link");
    const intervalValue = $("interval-value");
    const shownInterval = step === 5 ? secondsText : step === 6 ? intervalText : "";
    intervalLink.hidden = step === 0;
    intervalLink.setAttribute("aria-label", shownInterval ? `標本間隔 ${shownInterval}、計算へ` : "標本間隔の計算へ");
    intervalLink.setAttribute("aria-current", step >= 5 ? "step" : "false");
    intervalValue.hidden = !shownInterval;
    intervalValue.textContent = shownInterval;
    const [title, formula, note] = explain(index, candidate);
    $("step-title").textContent = title;
    $("formula").hidden = formula.length === 0;
    $("formula").replaceChildren(...formula);
    $("formula").dataset.comparing = String(Boolean(candidate));
    $("step-note").textContent = note;
    $("counter").textContent = `${step + 1} / ${lastStep + 1}`;
    $("seek").value = step;
    $("seek").setAttribute("aria-valuetext", `${step + 1} / ${lastStep + 1}、${title}`);
    $("prev").setAttribute("aria-disabled", String(step === 0));
    $("next").setAttribute("aria-disabled", String(step === lastStep));
    $("comparison").hidden = step !== lastStep;
    choiceButtons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === compared)));
  }

  function move(value) {
    if (value < 0 || value > lastStep || value === step) return;
    step = value;
    if (step === 0 || step >= 4) selected = null;
    compared = null;
    draw();
  }

  $("prev").addEventListener("click", () => move(step - 1));
  $("next").addEventListener("click", () => move(step + 1));
  $("seek").addEventListener("input", event => move(Number(event.target.value)));
  $("interval-link").addEventListener("click", () => {
    selected = compared = null;
    step = 5;
    draw();
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const source = selected !== null ? sampleButtons[selected] : choiceButtons[compared];
    if (!source) return;
    selected = compared = null;
    draw();
    source.focus({ preventScroll: true });
    event.preventDefault();
  });
  draw();
  api?.ready();
})();
