import { queryOptions } from "@tanstack/react-query"
import { File, Directory, Paths } from 'expo-file-system';
import { logger } from "@/logger";
import { uiKeys } from "./uiKeys";
import { SupabaseClient } from "@/lib/supabase/client";

const UI_DIRECTORY = new Directory(Paths.cache, 'ui');
const UI_BACKGROUND_DIRECTORY = new Directory(UI_DIRECTORY, 'backgrounds');

export const uiBackgroundsOptions = ({
	supabase,
} : {
	supabase: SupabaseClient,
}) => {
	return queryOptions({
		queryKey: uiKeys.backgrounds(),
		queryFn: async () => {
			const { data, error } = await supabase
				.rpc('get_ui_backgrounds');
			if (error) throw error;
			
			if (!UI_BACKGROUND_DIRECTORY.exists) {
				UI_BACKGROUND_DIRECTORY.create({
					intermediates: true,
				});
			}

			const entries = UI_BACKGROUND_DIRECTORY.list();
			const localFiles = entries.filter((entry) => entry instanceof File);
			const validIds = new Set(data.map(item => item.id.toString()));

			// Remove files that are no longer valid
			for (const file of localFiles) {
				const id = file.name.split('.')[0];
				if (!validIds.has(id)) {
					file.delete();
					logger.info(`🗑️ Removed outdated UI background ${id}`);
				}
			}

			// Download missing files
			const cached = await Promise.all(
				data.map(async (item) => {
				const file = new File(UI_BACKGROUND_DIRECTORY, `${item.id}.jpg`);
				if (!file.exists) {
					try {
						await File.downloadFileAsync(item.url, file);
						logger.log(`✅ Cached UI background ${item.id}`);
					} catch (e) {
						logger.error(`❌ Failed to cache ${item.url}: ${e}`);
					}
				}

				return { ...item, localUri: file.uri };
				})
			);

			return cached;
		},
		// staleTime: 24 * 60 * 60 * 1000, // 24 hours
		// gcTime: 48 * 60 * 60 * 1000, // 48 hours
	});
};