import express from 'express';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';

import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  AIMessagePromptTemplate,
} from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const openAiApiKey = process.env.openAiApiKey;
const modelName = process.env.modelName;
const systemMessageOne = process.env.systemMessageOne;
const aIMessageOne = process.env.aIMessageOne;
const humanMessageOne = process.env.humanMessageOne;
const aIMessageTwo = process.env.aIMessageTwo;
const humanMessageTwo = process.env.humanMessageTwo;
const aIMessagePromptTemplate = process.env.aIMessagePromptTemplate;

// Request validation middleware
const validateRequest = [
  body('product').notEmpty().withMessage('Product is required'),
  body('customers').notEmpty().withMessage('Customers is required'),
];

/**
 * Function to generate lead generation prompt using GPT-3.5 Turbo.
 *
 * @param {string} product - The detailed description of the product.
 * @param {string} customers - The details of the target customers.
 * @returns {string} - The generated insights as a bullet list.
 */
const neoitoLeadGenPrompt = async (product, customers) => {
  try {
    const openai = new ChatOpenAI({
      temperature: 0.7,
      modelName: modelName,
      openAIApiKey: openAiApiKey,
    });

    const template = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(`${systemMessageOne}`),
      AIMessagePromptTemplate.fromTemplate(`${aIMessageOne}`),
      HumanMessagePromptTemplate.fromTemplate(`${humanMessageOne}`),
      AIMessagePromptTemplate.fromTemplate(`${aIMessageTwo}`),
      HumanMessagePromptTemplate.fromTemplate(`${humanMessageTwo}`),
      AIMessagePromptTemplate.fromTemplate(`${aIMessagePromptTemplate}`),
    ]);

    const chain = new LLMChain({ llm: openai, prompt: template });
    const response = await chain.call({ product, customers });
    return response.text.split("---")[1].replace("---", "");
  } catch (error) {
    console.error('Error generating lead generation prompt:', error);
    throw new Error('Failed to generate lead generation prompt');
  }
};

app.use(express.json());

app.post('/neoito-gen', validateRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product, customers } = req.body;
    const response = await neoitoLeadGenPrompt(product, customers);
    res.send(response);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
