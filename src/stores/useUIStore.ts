import { UserActivityType, UserRecosType, UserWatchlistType, ViewType } from '@recomendapp/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import zustandStorage from './storage';

interface UIStore {
  heartPicks: { tab: UserActivityType; view: ViewType };
  setHeartPicksTab: (tab: UserActivityType) => void;
  setHeartPicksView: (view: ViewType) => void;

  watchlist: { tab: UserWatchlistType; view: ViewType };
  setWatchlistTab: (tab: UserWatchlistType) => void;
  setWatchlistView: (view: ViewType) => void;

  myRecos: { tab: UserRecosType; view: ViewType };
  setMyRecosTab: (tab: UserRecosType) => void;
  setMyRecosView: (view: ViewType) => void;

  playlistView: ViewType;
  setPlaylistView: (view: ViewType) => void;

  feedView: 'community' | 'cast_and_crew';
  setFeedView: (view: 'community' | 'cast_and_crew') => void;

  notificationsView: 'all' | 'unread' | 'archived';
  setNotificationsView: (view: 'all' | 'unread' | 'archived') => void;
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
			watchlist: {
				tab: 'movie',
				view: 'grid',
			},
			setWatchlistTab: (tab) => set(state => ({
				watchlist: { ...state.watchlist, tab },
			})),
			setWatchlistView: (view) => set(state => ({
				watchlist: { ...state.watchlist, view },
			})),
			// My Recos
			myRecos: {
				tab: 'movie',
				view: 'grid',
			},
			setMyRecosTab: (tab) => set(state => ({
				myRecos: { ...state.myRecos, tab },
			})),
			setMyRecosView: (view) => set(state => ({
				myRecos: { ...state.myRecos, view },
			})),
			// Playlist
			playlistView: 'list',
			setPlaylistView: (view) => set({ playlistView: view }),
			// Feed
			feedView: 'community',
			setFeedView: (view) => set({ feedView: view }),
			// Notifications
			notificationsView: 'all',
			setNotificationsView: (view) => set({ notificationsView: view }),
		}),
		{
			name: 'ui-storage',
			storage: createJSONStorage(() => zustandStorage),
		}
	)
);