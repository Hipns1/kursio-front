export function is401(e: unknown) {
  return (e as Error)?.message?.startsWith('401')
}
