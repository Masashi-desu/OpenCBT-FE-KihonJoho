export const probabilities = [0.1, 0.2, 0.4, 0.8, 2, 4, 7, 10, 15, 20, 30];
export const capacities = [70, 71, 72, 73, 74, 75, 86];
export const trafficTable = [
  [46.8, 48.2, 49.6, 51.2, 53.5, 55.5, 57.3, 58.6, 60.1, 61.3, 63.1],
  [47.6, 49.0, 50.5, 52.0, 54.4, 56.4, 58.2, 59.5, 61.0, 62.2, 64.1],
  [48.5, 49.8, 51.3, 52.9, 55.3, 57.3, 59.1, 60.4, 62.0, 63.2, 65.1],
  [49.3, 50.7, 52.1, 53.8, 56.1, 58.2, 60.0, 61.3, 62.9, 64.1, 66.0],
  [50.1, 51.5, 53.0, 54.6, 57.0, 59.1, 60.9, 62.2, 63.8, 65.1, 66.9],
  [50.9, 52.3, 53.8, 55.5, 57.9, 60.0, 61.9, 63.2, 64.8, 66.0, 67.9],
  [60.0, 61.5, 63.2, 65.0, 67.6, 69.9, 71.9, 73.3, 75.0, 76.3, 78.4],
];
const streamingCases = [
  { rateTenths: 5, requests: 15, duration: 4, stored: 1000, allowed: 10, observed: 86, space: [1.5, 12, 15, 30, 120], bandwidth: [7.5, 15, 30, 60, 75], waiting: [0.1, 0.2, 0.4, 0.8, 4] },
  { rateTenths: 4, requests: 20, duration: 3, stored: 5000, allowed: 7, observed: 75, space: [4.5, 36, 45, 90, 360], bandwidth: [8, 12, 24, 48, 60], waiting: [0.8, 2, 4, 7, 10] },
  { rateTenths: 6, requests: 17, duration: 3.5, stored: 4000, allowed: 4, observed: 71, space: [6.3, 50.4, 63, 126, 504], bandwidth: [10.2, 30, 35.7, 71.4, 90], waiting: [4, 7, 10, 15, 20] },
  { rateTenths: 5, requests: 31, duration: 2, stored: 1600, allowed: 10, observed: 72, space: [1.2, 9.6, 12, 24, 96], bandwidth: [15.5, 24, 31, 62, 75], waiting: [4, 7, 10, 15, 20] },
];
export function streamingCase(index: number) {
  return streamingCases[index];
}
