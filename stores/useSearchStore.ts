import { create } from "zustand";

export type SearchType = "movies" | "tv_series" | "persons" | "playlists" | "users" | null;

type SearchStore = {
    search: string;
    debouncedSearch: string;
    debounceTimer: number | null;
    setSearch: (search: string) => void;

    type: SearchType;
    setType: (type: SearchType) => void;
};

const useSearchStore = create<SearchStore>((set, get) => ({
    search: "",
    debouncedSearch: "",
    debounceTimer: null,
    
    setSearch: (search) => {
        const currentTimer = get().debounceTimer;
        if (currentTimer) {
            clearTimeout(currentTimer);
        }
        set({ search });
        const newTimer = setTimeout(() => {
            set({ debouncedSearch: search });
        }, 300);

        set({ debounceTimer: newTimer });
    },

    type: null,
    setType: (type) => set({ type }),
}));

export default useSearchStore;
export type { SearchStore };