import campaign from "@/data/campaign.json";

export type Campaign = typeof campaign;
export type CampaignDoc = Campaign["documents"][number];
export type CampaignSession = Campaign["sessions"][number];
export type CampaignImage = Campaign["images"][number];
export type PartyMember = Campaign["party"][number];
export type CampaignNpc = Campaign["npcs"][number];
export type CampaignBattle = Campaign["battles"][number];
export type CampaignLocation = Campaign["locations"][number];
export type CampaignQuest = Campaign["quests"][number];

export function getCampaign(): Campaign {
  return campaign as Campaign;
}

export function findDocById(id: string): CampaignDoc | undefined {
  return (campaign as Campaign).documents.find((d) => d.id === id);
}

export function findNpcById(id: string): CampaignNpc | undefined {
  return (campaign as Campaign).npcs?.find((n) => n.id === id);
}

export function findBattleById(id: string): CampaignBattle | undefined {
  return (campaign as Campaign).battles?.find((b) => b.id === id);
}

export function findLocationById(id: string): CampaignLocation | undefined {
  return (campaign as Campaign).locations?.find((l) => l.id === id);
}

export function findSessionById(id: string): CampaignSession | undefined {
  return (campaign as Campaign).sessions?.find((s) => s.id === id);
}

export function findSessionByDocId(docId: string): CampaignSession | undefined {
  return (campaign as Campaign).sessions?.find((s) => s.docId === docId);
}

export function isSessionDocId(docId: string): boolean {
  return (campaign as Campaign).sessions?.some((s) => s.docId === docId) ?? false;
}

export function isSessionDoc(doc: CampaignDoc): boolean {
  return isSessionDocId(doc.id);
}

export function isDmOnlyDoc(doc: CampaignDoc): boolean {
  const path = doc.path ?? "";
  return doc.category === "DM Guide" || path.includes("/DM Guide/");
}
