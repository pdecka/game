export const VIP_LAYERS = [
  { name: 'Bronze', minUsd: 10_000 },
  { name: 'Silver', minUsd: 15_000 },
  { name: 'Gold', minUsd: 100_000 },
  { name: 'Platinum', minUsd: 1_000_000 },
  { name: 'Diamond', minUsd: 1_500_000 },
] as const

export type VipLayerName = (typeof VIP_LAYERS)[number]['name']

export function vipFromVolume(volumeUsd: number) {
  const volume = Math.max(0, Number(volumeUsd) || 0)
  let currentName: VipLayerName | 'Member' = 'Member'
  let currentMin = 0
  let next = VIP_LAYERS[0]

  for (let i = 0; i < VIP_LAYERS.length; i += 1) {
    const layer = VIP_LAYERS[i]
    if (volume >= layer.minUsd) {
      currentName = layer.name
      currentMin = layer.minUsd
      next = VIP_LAYERS[i + 1] ?? null
    } else {
      break
    }
  }

  if (!next) {
    return {
      currentName,
      nextName: null as string | null,
      percent: 100,
      volumeUsd: volume,
      nextMinUsd: currentMin,
    }
  }

  const span = Math.max(next.minUsd - currentMin, 1)
  const percent = Math.min(100, Math.max(0, ((volume - currentMin) / span) * 100))

  return {
    currentName,
    nextName: next.name,
    percent,
    volumeUsd: volume,
    nextMinUsd: next.minUsd,
  }
}
