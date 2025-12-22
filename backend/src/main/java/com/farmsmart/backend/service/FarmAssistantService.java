package com.farmsmart.backend.service;

import com.farmsmart.backend.agent.FarmAssistantAgent;
import com.farmsmart.backend.tools.DatabaseTool;
import com.farmsmart.backend.tools.KnowledgeTool;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import org.springframework.stereotype.Service;

/**
 * Service layer for the Farm Assistant AI.
 * 
 * This service now uses the intent-driven architecture:
 * - DatabaseTool uses IntentClassifier + QueryPlanner (no raw SQL from LLM)
 * - KnowledgeTool remains unchanged (RAG for knowledge base)
 * - ChatLanguageModel is injected from AIConfig
 */
@Service
public class FarmAssistantService {

    private final FarmAssistantAgent agent;

    public FarmAssistantService(
            ChatLanguageModel chatModel,
            DatabaseTool databaseTool, 
            KnowledgeTool knowledgeTool) {
        
        // Build the AI agent with intent-based tools
        this.agent = AiServices.builder(FarmAssistantAgent.class)
                .chatLanguageModel(chatModel)
                .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
                .tools(databaseTool, knowledgeTool)
                .build();
    }

    public String chat(String userMessage) {
        try {
            return agent.chat(userMessage);
        } catch (Throwable e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
