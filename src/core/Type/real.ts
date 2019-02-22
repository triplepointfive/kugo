// TODO: Reuse for real
// export type NumberBound =
//   | { readonly type: "inclusive" | "exclusive"; readonly value: number }
//   | { readonly type: "infinity" };
//
// export class NumberInterval implements NumberInterval {
//   constructor(
//     public readonly bottom: NumberBound,
//     public readonly upper: NumberBound,
//   ) { }
//
//   public get isUniversal(): boolean {
//     return this.negativeInf && this.positiveInf;
//   }
//
//   public get negativeInf(): boolean {
//     return this.bottom.type === "infinity";
//   }
//
//   public get positiveInf(): boolean {
//     return this.upper.type === "infinity";
//   }
//
//   public intersection(interval: NumberInterval): NumberInterval | undefined {
//     const a = max(this.bottom, interval.bottom);
//     const b = min(this.upper, interval.upper);
//
//     if (a.type !== "infinity" && b.type !== "infinity") {
//       if (a.value > b.value) {
//         return undefined;
//       } else if (
//         a.value === b.value &&
//         (a.type === "exclusive" || b.type === "exclusive")
//       ) {
//         return undefined;
//       }
//     }
//
//     return new NumberInterval(a, b);
//   }
//  public display(): string {
//    return `${bottom.type === "inclusive" ? "[" : "("}${
//      bottom.type === "infinity" ? "-∞" : bottom.value
//      }, ${upper.type === "infinity" ? "+∞" : upper.value}${
//      upper.type === "inclusive" ? "]" : ")"
//      }`;
//  }
// }

// Min is only affecting positive infinity
// const min = (a: NumberBound, b: NumberBound): NumberBound => {
//  if (a.type === "infinity") {
//    return b;
//  }
//
//  if (b.type === "infinity") {
//    return a;
//  }
//
//  if (a.value === b.value) {
//    return {
//      type:
//        a.type === "exclusive" || b.type === "exclusive"
//          ? "exclusive"
//          : "inclusive",
//      value: a.value,
//    };
//  }
//
//  if (a.value < b.value) {
//    return a;
//  } else {
//    return b;
//  }
// };
//
//// Max is only affecting negative infinity
// const max = (a: NumberBound, b: NumberBound): NumberBound => {
//  if (a.type === "infinity") {
//    return b;
//  }
//
//  if (b.type === "infinity") {
//    return a;
//  }
//
//  if (a.value === b.value) {
//    return {
//      type:
//        a.type === "exclusive" && b.type === "exclusive"
//          ? "exclusive"
//          : "inclusive",
//      value: a.value,
//    };
//  }
//
//  if (a.value > b.value) {
//    return a;
//  } else {
//    return b;
//  }
// };
//
