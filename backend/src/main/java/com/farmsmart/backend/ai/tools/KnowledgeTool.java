package com.farmsmart.backend.ai.tools;

import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class KnowledgeTool {

    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;

    public KnowledgeTool(EmbeddingStore<TextSegment> embeddingStore, EmbeddingModel embeddingModel) {
        this.embeddingStore = embeddingStore;
        this.embeddingModel = embeddingModel;
    }

    @Tool("Search the poultry manuals for advice on health, feeding, farming practices, or diseases.")
    public String searchManuals(String query) {
        try {
            Embedding questionEmbedding = embeddingModel.embed(query).content();
            
            EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(EmbeddingSearchRequest.builder()
                    .queryEmbedding(questionEmbedding)
                    .maxResults(3)
                    .minScore(0.7)
                    .build());

            String results = searchResult.matches().stream()
                    .map(match -> match.embedded().text())
                    .collect(Collectors.joining("\n---\n"));
            
            if (results.isEmpty()) {
                return "No relevant information found in the manuals.";
            }
            
            return results;
        } catch (Exception e) {
            return "Error searching manuals: " + e.getMessage();
        }
    }
}
