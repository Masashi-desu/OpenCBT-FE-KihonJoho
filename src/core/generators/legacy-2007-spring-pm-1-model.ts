export const registerCases = [
  { registers: [0x1234,0x8361,0x5f2a,0xc38b,0x0010], shift: 8, fixed: 3, multiplier: 10 },
  { registers: [0x2461,0x9113,0x5f2a,0x76a9,0x0020], shift: 8, fixed: 2, multiplier: 9 },
  { registers: [0x4231,0x1812,0xab65,0x3bf6,0x0018], shift: 8, fixed: 1, multiplier: 6 },
  { registers: [0x14a2,0x2401,0x3174,0x7d97,0x0030], shift: 8, fixed: 1, multiplier: 4 },
] as const;
export const wordHex = (n: number) => n.toString(16).toUpperCase().padStart(4, '0');
