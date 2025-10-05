import { create } from "zustand";

export type SearchType = "movies" | "tv_series" | "persons" | "playlists" | "users";

type SearchStore = {
    search: string;
    setSearch: (search: string) => void;
};

const useSearchStore = create<SearchStore>((set, get) => ({
    search: "",
    setSearch: (search) => set({ search }),
}));

export default useSearchStore;
export type { SearchStore };