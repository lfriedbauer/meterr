import { type ResearchQuery, type ResearchResponse, UnifiedLLMClient } from '@meterr/llm-client';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize LLM client with API keys from environment
const llmClient = new UnifiedLLMClient({
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  google: process.env.GOOGLE_API_KEY,
  perplexity: process.env.PERPLEXITY_API_KEY,
  xai: process.env.XAI_API_KEY,
});

// Store for research results
const researchStore = new Map<string, ResearchResponse[]>();
const RESULTS_DIR = path.join(process.cwd(), 'mcp-research-results');

// Ensure results directory exists
if (!existsSync(RESULTS_DIR)) {
  mkdirSync(RESULTS_DIR, { recursive: true });
}

// Create MCP server
const server = new Server(
  {
    name: 'llm-research-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_single_llm',
        description: 'Query a single LLM service with a prompt',
        inputSchema: {
          type: 'object',
          properties: {
            service: {
              type: 'string',
              enum: ['openai', 'anthropic', 'google', 'perplexity', 'grok'],
              description: 'The LLM service to query',
            },
            prompt: {
              type: 'string',
              description: 'The prompt to send to the LLM',
            },
            model: {
              type: 'string',
              description: 'Optional: specific model to use',
            },
            temperature: {
              type: 'number',
              description: 'Optional: temperature for response generation (0-1)',
            },
          },
          required: ['service', 'prompt'],
        },
      },
      {
        name: 'query_all_llms',
        description: 'Query all configured LLM services with the same prompt',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The prompt to send to all LLMs',
            },
            temperature: {
              type: 'number',
              description: 'Optional: temperature for response generation (0-1)',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'execute_research_batch',
        description: 'Execute a batch of research queries from a JSON file',
        inputSchema: {
          type: 'object',
          properties: {
            batch_file: {
              type: 'string',
              description: 'Path to JSON file containing research queries',
            },
          },
          required: ['batch_file'],
        },
      },
      {
        name: 'analyze_responses',
        description: 'Analyze collected responses for patterns and insights',
        inputSchema: {
          type: 'object',
          properties: {
            research_id: {
              type: 'string',
              description: 'ID of the research session to analyze',
            },
          },
          required: ['research_id'],
        },
      },
      {
        name: 'save_research_results',
        description: 'Save research results to a file',
        inputSchema: {
          type: 'object',
          properties: {
            research_id: {
              type: 'string',
              description: 'ID of the research session',
            },
            filename: {
              type: 'string',
              description: 'Output filename (without extension)',
            },
          },
          required: ['research_id', 'filename'],
        },
      },
      {
        name: 'get_research_cost',
        description: 'Calculate the total cost of research queries',
        inputSchema: {
          type: 'object',
          properties: {
            research_id: {
              type: 'string',
              description: 'ID of the research session',
            },
          },
          required: ['research_id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'query_single_llm': {
      const { service, prompt, model, temperature } = args as any;
      const query: ResearchQuery = { prompt, model, temperature };

      try {
        let response: ResearchResponse;

        switch (service) {
          case 'openai':
            response = await llmClient.queryOpenAI(query);
            break;
          case 'anthropic':
            response = await llmClient.queryClaude(query);
            break;
          case 'google':
            response = await llmClient.queryGemini(query);
            break;
          case 'perplexity':
            response = await llmClient.queryPerplexity(query);
            break;
          case 'grok':
            response = await llmClient.queryGrok(query);
            break;
          default:
            throw new Error(`Unknown service: ${service}`);
        }

        // Store result
        const researchId = `single-${Date.now()}`;
        researchStore.set(researchId, [response]);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  research_id: researchId,
                  service: response.service,
                  model: response.model,
                  response: response.response,
                  usage: response.usage,
                  timestamp: response.timestamp,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error querying ${service}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    case 'query_all_llms': {
      const { prompt, temperature } = args as any;
      const query: ResearchQuery = { prompt, temperature };

      try {
        const responses = await llmClient.queryAll(query);

        // Store results
        const researchId = `batch-${Date.now()}`;
        researchStore.set(researchId, responses);

        // Format response summary
        const summary = responses.map((r: ResearchResponse) => ({
          service: r.service,
          model: r.model,
          preview: r.response.substring(0, 200) + '...',
          cost: r.usage?.totalCost,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  research_id: researchId,
                  total_responses: responses.length,
                  services_queried: responses.map((r: ResearchResponse) => r.service),
                  total_cost: responses
                    .reduce(
                      (sum: number, r: ResearchResponse) => sum + (r.usage?.totalCost || 0),
                      0
                    )
                    .toFixed(4),
                  responses: summary,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error querying LLMs: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    case 'execute_research_batch': {
      const { batch_file } = args as any;

      try {
        // Load batch file
        const batchPath = path.resolve(batch_file);
        if (!existsSync(batchPath)) {
          throw new Error(`Batch file not found: ${batchPath}`);
        }

        const batchData = JSON.parse(readFileSync(batchPath, 'utf-8'));
        const queries: ResearchQuery[] = batchData.queries || batchData;

        // Execute all queries
        const allResponses: ResearchResponse[] = [];
        let totalCost = 0;

        for (let i = 0; i < queries.length; i++) {
          console.log(`Executing query ${i + 1}/${queries.length}...`);
          const responses = await llmClient.queryAll(queries[i]);
          allResponses.push(...responses);

          // Calculate cost
          responses.forEach((r) => {
            if (r.usage?.totalCost) {
              totalCost += r.usage.totalCost;
            }
          });

          // Rate limiting
          if (i < queries.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // Store results
        const researchId = `batch-${Date.now()}`;
        researchStore.set(researchId, allResponses);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  research_id: researchId,
                  total_queries: queries.length,
                  total_responses: allResponses.length,
                  total_cost: totalCost.toFixed(4),
                  services_used: [...new Set(allResponses.map((r) => r.service))],
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing batch: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    case 'analyze_responses': {
      const { research_id } = args as any;
      const responses = researchStore.get(research_id);

      if (!responses) {
        return {
          content: [
            {
              type: 'text',
              text: `No research found with ID: ${research_id}`,
            },
          ],
          isError: true,
        };
      }

      // Analyze responses for common themes
      const keywords = new Map<string, number>();
      const sentiments = { positive: 0, negative: 0, neutral: 0 };

      responses.forEach((response) => {
        const text = response.response.toLowerCase();

        // Extract keywords (simple approach)
        const words = text.split(/\s+/).filter((w: string) => w.length > 5);
        words.forEach((word: string) => {
          keywords.set(word, (keywords.get(word) || 0) + 1);
        });

        // Simple sentiment analysis
        if (text.includes('excellent') || text.includes('great') || text.includes('valuable')) {
          sentiments.positive++;
        } else if (text.includes('poor') || text.includes('lacking') || text.includes('missing')) {
          sentiments.negative++;
        } else {
          sentiments.neutral++;
        }
      });

      // Get top keywords
      const topKeywords = Array.from(keywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word, count]) => ({ word, count }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                research_id,
                total_responses: responses.length,
                services: [...new Set(responses.map((r) => r.service))],
                sentiment_analysis: sentiments,
                top_keywords: topKeywords,
                average_response_length: Math.round(
                  responses.reduce((sum, r) => sum + r.response.length, 0) / responses.length
                ),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    case 'save_research_results': {
      const { research_id, filename } = args as any;
      const responses = researchStore.get(research_id);

      if (!responses) {
        return {
          content: [
            {
              type: 'text',
              text: `No research found with ID: ${research_id}`,
            },
          ],
          isError: true,
        };
      }

      const outputPath = path.join(RESULTS_DIR, `${filename}.json`);
      const output = {
        research_id,
        timestamp: new Date().toISOString(),
        total_responses: responses.length,
        total_cost: responses.reduce((sum, r) => sum + (r.usage?.totalCost || 0), 0),
        responses: responses,
      };

      writeFileSync(outputPath, JSON.stringify(output, null, 2));

      return {
        content: [
          {
            type: 'text',
            text: `Research results saved to: ${outputPath}`,
          },
        ],
      };
    }

    case 'get_research_cost': {
      const { research_id } = args as any;
      const responses = researchStore.get(research_id);

      if (!responses) {
        return {
          content: [
            {
              type: 'text',
              text: `No research found with ID: ${research_id}`,
            },
          ],
          isError: true,
        };
      }

      const costByService = new Map<string, number>();
      let totalCost = 0;

      responses.forEach((response) => {
        if (response.usage?.totalCost) {
          totalCost += response.usage.totalCost;
          costByService.set(
            response.service,
            (costByService.get(response.service) || 0) + response.usage.totalCost
          );
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                research_id,
                total_cost: totalCost.toFixed(4),
                cost_by_service: Object.fromEntries(
                  Array.from(costByService.entries()).map(([service, cost]) => [
                    service,
                    cost.toFixed(4),
                  ])
                ),
                average_cost_per_query: (totalCost / responses.length).toFixed(4),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    default:
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('LLM Research MCP server running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
