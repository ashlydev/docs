export function toVectorString(values: number[]) {
  return `[${values.map((value) => Number(value.toFixed(8))).join(",")}]`;
}
