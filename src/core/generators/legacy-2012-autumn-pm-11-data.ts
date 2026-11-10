export const timerCases = [
  { delays: { long: 4, short: 2 }, order: ['long', 'short'], clock: [21, 1, 40], changedClock: [23, 45, 15] },
  { delays: { long: 3, short: 1 }, order: ['short', 'long'], clock: [10, 25, 19], changedClock: [20, 11, 38] },
  { delays: { long: 6, short: 3 }, order: ['long', 'short'], clock: [12, 15, 33], changedClock: [20, 10, 56] },
  { delays: { long: 5, short: 2 }, order: ['short', 'long'], clock: [13, 58, 58], changedClock: [21, 22, 58] },
] as const;

export function timerOutput(index: number, modified: boolean) {
  const { delays, order, clock, changedClock } = timerCases[index];
  const [hour, minute, second] = modified ? changedClock : clock;
  const time = (offset: number) => {
    const duration = hour * 3600 + minute * 60 + second + offset;
    const hhmmss = [Math.floor(duration / 3600), Math.floor(duration / 60) % 60, duration % 60]
      .map(value => String(value).padStart(2, '0')).join(':');
    return 'Mon Oct 01 ' + hhmmss + ' JST 2012';
  };
  return [
    ...order.map(name => name + ' timer: onStart at ' + time(0)),
    (modified ? '[g1]' : 'short timer') + ': onAlarm at ' + time(delays.short),
    (modified ? '[g2]' : 'long timer') + ': onCancel at ' + time(delays.short),
  ].join('\n');
}
