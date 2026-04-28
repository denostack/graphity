
export function toDashCase(name: string): string {
  return name
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/[._]/g, '-')
    .replace(/^-/, '')
    .replace(/-+/, '-')
}
