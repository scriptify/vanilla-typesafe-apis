import allCharacters from './dataset.json';

export async function getAllRickAndMortyCharacters() {
  return allCharacters.results;
}
