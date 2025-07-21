import { PostgrestError } from '@supabase/supabase-js';

const isPostgrestError = (error: unknown): error is PostgrestError => {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		'code' in error &&
		'details' in error
	);
};

export default isPostgrestError;
