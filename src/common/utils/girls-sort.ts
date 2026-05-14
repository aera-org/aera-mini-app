import type { ICharacter, IScenario } from '@/common/types';

function parseDate(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function hasTopScenario(character: ICharacter): boolean {
  return (character.scenarios ?? []).some((scenario) => scenario.isTop);
}

export function compareScenarios(a: IScenario, b: IScenario): number {
  if (a.isTop !== b.isTop) {
    return a.isTop ? -1 : 1;
  }

  if (a.isActive !== b.isActive) {
    return a.isActive ? -1 : 1;
  }

  return parseDate(b.createdAt) - parseDate(a.createdAt);
}

export function sortScenarios<T extends IScenario>(scenarios: T[] = []): T[] {
  return [...scenarios].sort(compareScenarios);
}

export function sortCharacterScenarios(character: ICharacter): ICharacter {
  return {
    ...character,
    scenarios: sortScenarios(character.scenarios ?? []),
  };
}

export function compareGirlsByTopScenarioAndName(
  a: ICharacter,
  b: ICharacter,
): number {
  const aHasTopScenario = hasTopScenario(a);
  const bHasTopScenario = hasTopScenario(b);

  if (aHasTopScenario !== bHasTopScenario) {
    return aHasTopScenario ? -1 : 1;
  }

  return a.name.localeCompare(b.name);
}

export function sortGirlsForCatalog(girls: ICharacter[]): ICharacter[] {
  return [...girls]
    .map(sortCharacterScenarios)
    .sort(compareGirlsByTopScenarioAndName);
}
