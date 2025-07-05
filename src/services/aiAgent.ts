import { z } from 'zod';

const responseSchema = z.object({
  response: z.string()
});

const errorSchema = z.object({
  error: z.string(),
  details: z.string()
});

const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3000/api/query'
  : '/api/query';

export const processQuery = async (query: string): Promise<string> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Server is not running. Please start the server with `npm run server`');
      }
      
      const data = await response.json().catch(() => null);
      
      if (data) {
        const validatedError = errorSchema.safeParse(data);
        if (validatedError.success) {
          throw new Error(validatedError.data.details || 'Failed to process query');
        }
      }
      
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    const validatedData = responseSchema.safeParse(data);
    
    if (!validatedData.success) {
      throw new Error('Invalid response format from server');
    }

    return validatedData.data.response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please ensure the server is running with `npm run server`');
      }
      throw new Error(`Query processing failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while processing the query');
  }
};