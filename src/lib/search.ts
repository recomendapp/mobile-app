import { SearchClient } from '@recomendapp/search-client';
import * as env from '@/env';

export const searchClient = new SearchClient({
	baseUrl: env.SEARCH_BASE_URL,
});