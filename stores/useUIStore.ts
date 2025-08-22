import { UserActivityType, UserRecosType, UserWatchlistType, ViewType } from '@/types/type.db';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import zustandStorage from './storage';



interface UIStore {
  heartPicks: { tab: UserActivityType; view: ViewType };
  setHeartPicksTab: (tab: UserActivityType) => void;
  setHeartPicksView: (view: ViewType) => void;

  watchlistTab: { tab: UserWatchlistType; view: ViewType };
  setWatchlistTab: (tab: UserWatchlistType) => void;
  setWatchlistView: (view: ViewType) => void;

  myRecosTab: { tab: UserRecosType; view: ViewType };
  setMyRecosTab: (tab: UserRecosType) => void;
  setMyRecosView: (view: ViewType) => void;
}

export const useUIStore = create<UIStore>()(
	persist(
		(set) => ({
			// Heart Picks
			heartPicks: {
				tab: 'movie',
				view: 'grid',
			},
			setHeartPicksTab: (tab) => set(state => ({
				heartPicks: { ...state.heartPicks, tab },
			})),
			setHeartPicksView: (view) => set(state => ({
				heartPicks: { ...state.heartPicks, view },
			})),
			// Watchlist
			watchlistTab: {
				tab: 'movie',
				view: 'grid',
			},
			setWatchlistTab: (tab) => set(state => ({
				watchlistTab: { ...state.watchlistTab, tab },
			})),
			setWatchlistView: (view) => set(state => ({
				watchlistTab: { ...state.watchlistTab, view },
			})),
			// My Recos
			myRecosTab: {
				tab: 'movie',
				view: 'grid',
			},
			setMyRecosTab: (tab) => set(state => ({
				myRecosTab: { ...state.myRecosTab, tab },
			})),
			setMyRecosView: (view) => set(state => ({
				myRecosTab: { ...state.myRecosTab, view },
			})),
		}),
		{
			name: 'ui-storage',
			storage: createJSONStorage(() => zustandStorage),
		}
	)
);