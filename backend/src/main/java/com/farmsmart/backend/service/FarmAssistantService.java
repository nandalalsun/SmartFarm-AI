package com.farmsmart.backend.service;

import com.farmsmart.backend.agent.FarmAssistantAgent;
import com.farmsmart.backend.tools.DatabaseTool;
import com.farmsmart.backend.tools.KnowledgeTool;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.service.AiServices;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class FarmAssistantService {

    private final FarmAssistantAgent agent;

    public FarmAssistantService(DatabaseTool databaseTool, KnowledgeTool knowledgeTool) {
        
        ChatLanguageModel chatModel = OllamaChatModel.builder()
                .baseUrl("http://localhost:11434")
                .modelName("llama3.2")
                .timeout(Duration.ofSeconds(60)) // Increase timeout for tools
                .build();

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
