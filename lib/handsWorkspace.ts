export type HandsWorkspaceSection = "explore" | "review" | "track";

export interface HandsWorkspaceInitialState {
  hasActiveInvestigation: boolean;
  hasActiveFollowUp: boolean;
  hasPendingSuggestions: boolean;
  hasRemainingImportCandidates: boolean;
}

/** Chooses the workspace once from actionable state already stored by existing features. */
export function chooseInitialHandsWorkspaceSection(input: HandsWorkspaceInitialState): HandsWorkspaceSection {
  if (input.hasActiveInvestigation || input.hasActiveFollowUp) return "track";
  if (input.hasPendingSuggestions || input.hasRemainingImportCandidates) return "explore";
  return "review";
}
