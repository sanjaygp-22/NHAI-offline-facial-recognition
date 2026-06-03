import { FaceEmbedding, IdentifyCandidate, MatchResult } from "../../types/face";
import { thresholds } from "../config/thresholds";

export type EnrollmentRecord = {
  personId: string;
  embedding: FaceEmbedding;
};

export function matchEmbedding(
  query: FaceEmbedding,
  records: EnrollmentRecord[]
): MatchResult {
  if (records.length === 0) {
    return { status: "empty_gallery", candidates: [] };
  }

  const scored: IdentifyCandidate[] = records.map((record) => ({
    personId: record.personId,
    score: cosineSimilarity(query.vector, record.embedding.vector),
  }));

  scored.sort((a, b) => b.score - a.score);
  const bestMatch = scored[0];

  if (bestMatch.score < thresholds.similarity) {
    return { status: "no_match", candidates: scored.slice(0, 3) };
  }

  return {
    status: "ok",
    bestMatch,
    candidates: scored.slice(0, 3),
  };
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
