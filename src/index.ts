export type NumberBound =
  | { readonly type: "inclusive" | "exclusive"; readonly value: number }
  | { readonly type: "infinity" }

export interface NumberInterval {
  readonly bottom: NumberBound
  readonly upper: NumberBound
}

export type NumberSet = NumberInterval[]

export const displayNumberInterval = function({
  bottom,
  upper
}: NumberInterval): string {
  return `${bottom.type === "inclusive" ? "[" : "("}${
    bottom.type === "infinity" ? "-∞" : bottom.value
  }, ${upper.type === "infinity" ? "+∞" : upper.value}${
    upper.type === "inclusive" ? "]" : ")"
  }`
}

export const displayNumberBound = function(numberSet: NumberSet): string {
  return numberSet.map(displayNumberInterval).join(" ∪ ")
}
