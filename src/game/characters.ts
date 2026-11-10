export type HeadStyle = 'fedora' | 'cap' | 'headband' | 'hood'

export interface Character {
  id: string
  name: string
  role: string
  head: HeadStyle
  skin: string
  shirt: string
  sleeve: string
  pants: string
  shoes: string
  pack: string
  accent: string
}

export const CHARACTERS: Character[] = [
  {
    id: 'rex',
    name: 'Rex',
    role: 'Explorer',
    head: 'fedora',
    skin: '#e8b894',
    shirt: '#122d45',
    sleeve: '#1b4468',
    pants: '#3b2f2a',
    shoes: '#6b4a2f',
    pack: '#b4753a',
    accent: '#6b4a2f',
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Scout',
    head: 'cap',
    skin: '#c68a5e',
    shirt: '#2f7d6d',
    sleeve: '#3a9784',
    pants: '#4a4a3a',
    shoes: '#2d2d24',
    pack: '#8f5a2a',
    accent: '#e9c36a',
  },
  {
    id: 'kai',
    name: 'Kai',
    role: 'Monk',
    head: 'headband',
    skin: '#8d5a3b',
    shirt: '#d9822b',
    sleeve: '#e89a47',
    pants: '#a85d1a',
    shoes: '#5a3a20',
    pack: '#7a4e3a',
    accent: '#ba2b4c',
  },
  {
    id: 'zara',
    name: 'Zara',
    role: 'Shadow',
    head: 'hood',
    skin: '#f0c9a8',
    shirt: '#2b2f3a',
    sleeve: '#3a4050',
    pants: '#1c1f27',
    shoes: '#111318',
    pack: '#4a5062',
    accent: '#ba2b4c',
  },
]

export const DEFAULT_CHARACTER = CHARACTERS[0]

export function getCharacter(id: string | null): Character {
  return CHARACTERS.find((c) => c.id === id) ?? DEFAULT_CHARACTER
}
