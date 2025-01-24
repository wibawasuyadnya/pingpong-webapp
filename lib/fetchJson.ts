type FetcherArgs = [input: RequestInfo, init?: RequestInit];

interface FetcherError extends Error {
  response?: Response;
  data?: unknown;
}

export default async function fetcher<T>(...args: FetcherArgs): Promise<T> {
  const [input, init] = args; 

  try {
    const response = await fetch(input, {
      ...init, 
      credentials: "include", 
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    }

    const error = new Error(response.statusText) as FetcherError;
    error.response = response;
    error.data = data;
    throw error;
  } catch (error) {
    const e = error as FetcherError;
    if (!e.data) {
      e.data = { message: e.message };
    }
    throw e;
  }
}
