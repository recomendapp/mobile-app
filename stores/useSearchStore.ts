import { create } from "zustand";

type SearchStore = {
	search?: string;
	setSearch: (search: string) => void;
	filter: "movies" | "tv_series" | "persons" | "playlists" | "users" | null;
	setFilter: (filter: "movies" | "tv_series" | "persons" | "playlists" | "users" | null) => void;
};

const useSearchStore = create<SearchStore>((set) => ({
	search: undefined,
	setSearch: (search) => set({ search }),
	filter: null,
	setFilter: (filter) => set({ filter }),
}));

export default useSearchStore;
export type { SearchStore };