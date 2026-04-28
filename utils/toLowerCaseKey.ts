
export function toLowerCaseKey<TValue>(data: Record<string, TValue>) {
  return Object.entries(data)
    .map(([name, value]) => [name.toLocaleLowerCase(), value] as [string, TValue])
    .reduce<Record<string, TValue>>((carry, [name, value]) => ({ ...carry, [name]: value }), {})
}
