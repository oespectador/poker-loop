export function toggleSuggestionExpansion(currentId: string | undefined, suggestionId: string): string | undefined {
  return currentId === suggestionId ? undefined : suggestionId;
}
