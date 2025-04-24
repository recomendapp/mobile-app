import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient as createClientSupabase } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = (locale: string) => {
	return createClientSupabase<Database>(supabaseUrl, supabaseKey, {
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		},
		global: {
			headers: {
				'language': locale,
			}
		}
	});
}