'use server';

/**
 * @fileOverview Retrieves mock tender information based on a user query with tags.
 *
 * - tenderQueryTool - A function that handles the retrieval of tender information.
 * - TenderQueryInput - The input type for the tenderQueryTool function.
 * - TenderQueryOutput - The return type for the tenderQueryTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TenderQueryInputSchema = z.object({
  query: z.string().describe('The user query with tags (e.g., \'@Tender road construction @Location California\').'),
});
export type TenderQueryInput = z.infer<typeof TenderQueryInputSchema>;

const TenderQueryOutputSchema = z.object({
  tenderInfo: z.string().describe('The retrieved tender information based on the query.'),
});
export type TenderQueryOutput = z.infer<typeof TenderQueryOutputSchema>;

export async function tenderQueryTool(input: TenderQueryInput): Promise<TenderQueryOutput> {
  return tenderQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tenderQueryPrompt',
  input: {schema: TenderQueryInputSchema},
  output: {schema: TenderQueryOutputSchema},
  prompt: `You are an AI assistant specialized in retrieving tender information based on user queries.

  Based on the query and any provided tags, determine the relevant tender information to retrieve.
  Here are some mock tender examples:
  - Tender: Road Construction in California, Budget: $1,000,000, Location: California
  - Tender: School Building in New York, Budget: $5,000,000, Location: New York
  - Tender: Bridge Repair in Texas, Budget: $2,000,000, Location: Texas
  - Tender: Park Development in Florida, Budget: $3,000,000, Location: Florida
  - Tender: Water Treatment Plant in Washington, Budget: $4,000,000, Location: Washington

  Query: {{{query}}}

  Return the most relevant tender information based on the query.
  `,
});

const tenderQueryFlow = ai.defineFlow(
  {
    name: 'tenderQueryFlow',
    inputSchema: TenderQueryInputSchema,
    outputSchema: TenderQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
