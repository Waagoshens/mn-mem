/** Copyright © 2026 Eric Holton. All rights reserved. */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type NameKind = 'english' | 'scientific' | 'ojibwe';
export interface Source {
  citation: string;
  url: string | null;
}
export interface Review {
  status: ReviewStatus;
  reviewer: string | null;
  reviewedAt: string | null;
}
/** A concept can be a species, broader taxon, or culturally meaningful grouping. */
export interface Concept {
  id: string;
  scope: 'species' | 'taxon' | 'vernacular-group';
  memberConceptIds: string[];
  wordpressTagIds: number[];
  review: Review;
}
/** Independent entries allow one vernacular name to cover several concepts. */
export interface NameEntry {
  id: string;
  conceptIds: string[];
  kind: NameKind;
  text: string | null;
  language: string; // e.g. en, oj; scientific names use a separately sourced convention
  dialect: string | null;
  source: Source | null;
  review: Review;
}
export interface ApprovedImage {
  id: string;
  wordpressMediaId: number | null;
  url: string;
  alt: string;
  conceptIds: string[]; // Human-reviewed depiction, not inherited post tags.
  source: Source | null;
  rights: { status: 'pending' | 'approved' | 'rejected'; note: string | null };
  review: Review;
}
export interface Manifest {
  schemaVersion: 1;
  contentVersion: string;
  generatedAt: string;
  concepts: Concept[];
  names: NameEntry[];
  images: ApprovedImage[];
}
export type FaceSpec = { kind: 'image' } | { kind: 'name'; nameKind: NameKind; language: string; dialect: string | null };
export interface Mode {
  id: string;
  label: string;
  left: FaceSpec;
  right: FaceSpec;
}
export type Presentation =
  | { kind: 'image'; imageId: string; url: string; alt: string }
  | { kind: 'name'; nameId: string; text: string; language: string; dialect: string | null };
export interface Card {
  id: string; // Unique instance, NOT the matching key.
  matchKey: string; // Stable concept ID for this deck.
  face: Presentation;
}
