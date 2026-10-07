import {
  field,
  p,
  strings,
  variableNotes,
  type GenerationDefinition,
} from "./definition";

export const subjectAFormatDefinitions: GenerationDefinition[] = [
  {
    source: "2024-a-20",
    title: "産業財産権の分類",
    sourceAnswer: "ア",
    reference: [0],
    version: "3.2.0",
    answerVariation: "fixed",
    fields: [field("誤答群に混ぜる権利", 0, 7)],
    notes:
      variableNotes +
      " 四つの権利を列記する問いと各選択肢の四項目を保持する。正しい四権利は固定し、誤答群に混ぜる権利を変える。",
    build: ([index]) => {
      const rights = ["特許権", "実用新案権", "意匠権", "商標権"];
      const outsiders = [
        "著作権",
        "公表権",
        "氏名表示権",
        "同一性保持権",
        "複製権",
        "翻案権",
        "貸与権",
        "上演権",
      ];
      const wrong = Array.from({ length: 3 }, (_, i) =>
        rights
          .map((right, j) =>
            j === i ? outsiders[(index + i) % outsiders.length] : right,
          )
          .join("、"),
      );
      return {
        prompt: [p("日本において、産業財産権と総称される四つの権利はどれか。")],
        choices: strings([rights.join("、"), ...wrong]),
        explanation: `産業財産権は特許権、実用新案権、意匠権、商標権の四つである。誤答群の${Array.from({ length: 3 }, (_, i) => outsiders[(index + i) % outsiders.length]).join("、")}は著作権又は著作者人格権に属し、産業財産権の四つに含まれない。`,
      };
    },
  },
  {
    source: "2026-a-20",
    title: "著作権と著作者人格権",
    sourceAnswer: "イ",
    fields: [field("利用する行為と契約条件", 0, 3)],
    reference: [0],
    version: "3.2.0",
    notes:
      variableNotes +
      " 委託成果物の利用条件から制約の記述を選ぶ形式を保持し、権利の名称を選ぶ問いへ変更しない。",
    build: ([index]) => {
      const actions = [
        "B社を著作者とする表示をA社の著作者名へ変更する",
        "B社の意に反して図の内容を改変する",
        "未公表の図を初めて公表する",
        "図を複製してC社へ配布する",
      ];
      const conditions =
        index === 3
          ? "B社との契約では著作権をB社に留保し、A社への複製の許諾は与えない。"
          : index === 2
            ? "B社との契約では著作権をB社に留保し、A社には社内での利用だけを許諾する。公表は許諾せず、B社は未公表の図の公開に同意していない。"
            : "B社との契約では著作権を全てA社へ譲渡し、著作者人格権については特段の合意がない。";
      const constraints = [
        "著作権の譲渡だけでは、B社の著作者名をA社の著作者名へ変更することは認められない。",
        "著作権の譲渡だけでは、B社の意に反する図の改変が自由に認められるわけではない。",
        "社内利用だけの許諾では、A社が未公表の図を公表することは認められない。",
        "複製の許諾を受けていないA社は、B社に留保された複製権に基づく許諾を得る必要がある。",
      ];
      const distractors =
        index === 3
          ? [
              "制作を委託したので、契約にかかわらずA社は無条件に複製できる。",
              "著作者人格権だけをA社へ譲渡すれば、A社は複製の許諾を受ける必要がない。",
              "C社への配布であれば、複製権の許諾は常に不要である。",
            ]
          : index === 2
            ? [
                "社内利用の許諾を受ければ、未公表の図の一般公開も無条件に認められる。",
                "成果物を納品した時点で、B社の公表権はA社へ譲渡される。",
                "業務システムの開発目的であれば、公表の許諾は常に不要である。",
              ]
            : [
                "著作権をA社へ譲渡したので、B社の著作者人格権も全てA社へ移転する。",
                "制作を委託したので、B社は初めから著作者ではなく、著作者人格権をもたない。",
                "業務システムの開発目的であれば、著作者人格権による制約は常に適用されない。",
              ];
      return {
        prompt: [
          p(
            `A社は業務可視化をB社へ委託し、納品された業務フロー図をC社へ提示してシステム開発を委託する。${conditions}A社が「${actions[index]}」という利用を行う上で生じる制約として、適切なものはどれか。法定の例外に該当しないものとする。`,
          ),
        ],
        choices: strings([constraints[index], ...distractors]),
        explanation: `${constraints[index]}著作権法18条の公表、19条の氏名表示、20条の同一性保持と21条の複製を区別する。59条により著作者人格権は譲渡できない。`,
      };
    },
  },
];
