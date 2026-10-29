/** Discovery only. Nothing here grants a concept identification or content permission. */
export interface WordPressPost { id: number; tags: number[]; featured_media: number; }
export interface WordPressMedia { id: number; post: number | null; source_url: string; alt_text: string; }
export interface Candidate {
  mediaId: number;
  url: string;
  postId: number;
  tagIds: number[];
  evidence: 'featured-media' | 'attachment-parent';
  review: 'pending';
}
export interface WordPressReader {
  // Implement pagination, timeouts and response validation in a refresh-only adapter.
  listPostsByTag(tagId: number): AsyncIterable<WordPressPost>;
  getMedia(id: number): Promise<WordPressMedia | null>;
  listMediaByParent(postId: number): AsyncIterable<WordPressMedia>;
}
export function candidateFrom(post: WordPressPost, media: WordPressMedia): Candidate | null {
  const featured = post.featured_media === media.id && media.id > 0;
  if (!featured && media.post !== post.id) return null;
  return { mediaId: media.id, url: media.source_url, postId: post.id,
    tagIds: [...post.tags], evidence: featured ? 'featured-media' : 'attachment-parent', review: 'pending' };
}
