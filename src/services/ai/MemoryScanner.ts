import { vectorStorage } from '../../db/vectorStorage';
import type { LinkableEntityType } from '../../types/vectorTypes';
import { getEmbedder } from './embedder';
import { EntityFetcher, type RetrievedEntity } from './EntityFetcher';

export class RAGMemoryScanner {
  /**
   * Embeds the user prompt, queries the vector database for the top K semantic matches,
   * expands those matches by fetching their linked items, deduplicates everything,
   * and formats it all into a clean text block for the Shifu Sage.
   */
  static async buildContext(userPrompt: string, userId: string): Promise<string> {
    try {
      // 1. Ensure storage and embedder are ready
      if (!vectorStorage.isInitialized()) {
        await vectorStorage.initialize();
      }

      const embedder = getEmbedder();

      // 2. Embed the prompt
      const queryVector = await embedder.embed(userPrompt);

      // 3. Query Top 5 absolute closest semantic matches from the user's brain
      const topMatches = await vectorStorage.query(userId, queryVector, 5);

      if (!topMatches || topMatches.length === 0) {
        return 'No relevant historical context found.';
      }

      // 4. Fetch the full entity text for the Core matches
      const coreEntities: RetrievedEntity[] = [];
      for (const match of topMatches) {
        // We ensure we skip 'summary' types since those are synthetic
        if (match.entityType === 'summary') continue;

        const entity = await EntityFetcher.fetchEntity(
          match.entityType as LinkableEntityType,
          match.entityId
        );

        if (entity) {
          coreEntities.push(entity);
        }
      }

      // 5. Backlink Expansion: Find all connected ideas
      const extendedIds = new Set<string>();

      for (const core of coreEntities) {
        if (core.linkedObjectIds && Array.isArray(core.linkedObjectIds)) {
          for (const linkId of core.linkedObjectIds) {
            extendedIds.add(linkId);
          }
        }
      }

      // 6. Fetch Backlinks
      const backlinkEntities: RetrievedEntity[] = [];
      for (const linkId of extendedIds) {
        // Skip if we already fetched it as a Core entity (Deduplication Layer 1)
        if (coreEntities.some(c => c.id === linkId)) continue;

        // Resolve type dynamically via vector embeddings table
        const resolvedType = await EntityFetcher.resolveEntityType(linkId);

        if (resolvedType) {
          const entity = await EntityFetcher.fetchEntity(resolvedType, linkId);
          if (entity) {
            backlinkEntities.push(entity);
          }
        }
      }

      // 7. Format the Context Map
      let contextString = '=== CORE RETRIEVED MEMORIES ===\n';

      coreEntities.forEach((entity, index) => {
        contextString += `[Match ${index + 1} | Type: ${entity.type.toUpperCase()}]\n${
          entity.text
        }\n\n`;
      });

      if (backlinkEntities.length > 0) {
        contextString += '=== CONNECTED/LINKED MEMORIES ===\n';
        backlinkEntities.forEach((entity, index) => {
          contextString += `[Link ${index + 1} | Type: ${entity.type.toUpperCase()}]\n${
            entity.text
          }\n\n`;
        });
      }

      return contextString.trim();
    } catch (e) {
      console.error('RAG Scrape Failed:', e);
      return 'Context retrieval failed.';
    }
  }
}
