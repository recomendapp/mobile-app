import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient as createClientSupabase } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// export const supabase = createClient(supabaseUrl, supabaseKey, {
// 	// TODO: Check how to pass 'language' to header for localization in Supabase
// 	auth: {
// 		storage: AsyncStorage,
// 		autoRefreshToken: true,
// 		persistSession: true,
// 		detectSessionInUrl: true,
// 	}
// });

export const createClient = (locale: string) => {
	return createClientSupabase<Database>(supabaseUrl, supabaseKey, {
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: true,
		},
		global: {
			headers: {
				'language': locale,
			}
		}
	});
}