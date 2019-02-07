export interface Bound {
  bottom: number | "infinity"
  upper: number | "infinity"
}

export type NumberBound = Bound[]

export const displayBound = function({ bottom, upper }: Bound): string {
  return `${bottom === "infinity" ? "-∞" : bottom}, ${
    upper === "infinity" ? "+∞" : upper
  }`
}

export const displayNumberBound = function(numberBound: NumberBound): string {
  return numberBound.map(displayBound).join("∪")
}
