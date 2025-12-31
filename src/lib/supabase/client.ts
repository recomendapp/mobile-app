import { createClient as createClientSupabase } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { getRandomValues } from "expo-crypto";
import { Database } from "@recomendapp/types";
import * as env from "@/env";
import { createMMKV, MMKV } from "react-native-mmkv";

async function getOrCreateEncryptionKey(): Promise<string> {
  const KEY_NAME = "mmkv_encryption_key";

  let key = await SecureStore.getItemAsync(KEY_NAME);

  if (!key) {
	const randomBytes = new Uint8Array(32);
	getRandomValues(randomBytes);
	key = Array.from(randomBytes)
	  .map((b) => b.toString(16).padStart(2, "0"))
	  .join("");

	await SecureStore.setItemAsync(KEY_NAME, key);
  }

  return key;
}

let supabaseStorage: MMKV | null = null;

async function initializeStorage() {
  if (!supabaseStorage) {
	const encryptionKey = await getOrCreateEncryptionKey();

	supabaseStorage = createMMKV({
	  id: "supabase",
	  encryptionKey,
	});
  }

  return supabaseStorage;
}

class MMKVStore {
  private storage: MMKV | null = null;

  async ensureStorage() {
	if (!this.storage) {
	  this.storage = await initializeStorage();
	}
	return this.storage;
  }

  async getItem(key: string) {
	const storage = await this.ensureStorage();
	return storage.getString(key) ?? null;
  }

  async setItem(key: string, value: string) {
	const storage = await this.ensureStorage();
	storage.set(key, value);
  }

  async removeItem(key: string) {
	const storage = await this.ensureStorage();
	storage.remove(key);
  }
}

export const createClient = (locale?: string) => {
  return createClientSupabase<Database>(
	env.SUPABASE_URL,
	env.SUPABASE_ANON_KEY,
	{
	  auth: {
		storage: new MMKVStore(),
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	  },
	  ...(locale
		? {
			global: {
			  headers: {
				language: locale,
			  },
			},
		  }
		: {}),
	}
  );
};

export type SupabaseClient = ReturnType<typeof createClient>;

export const supabase = createClient();
