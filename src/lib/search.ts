import { SearchClient } from '@recomendapp/search-client';

const SEARCH_BASE_URL = process.env.EXPO_PUBLIC_SEARCH_BASE_URL!;

export const searchClient = new SearchClient({
	baseUrl: SEARCH_BASE_URL,
});