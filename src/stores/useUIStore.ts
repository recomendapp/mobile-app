import { UserActivityType, UserRecosType, UserWatchlistType, ViewType } from '@recomendapp/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './storage';

interface MapState {
  center: [number, number]; // [lng, lat]
  zoom: number;
  selectedMovieId: number | null;
}


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

  hasOnboarded: boolean;
  setHasOnboarded: (hasOnboarded: boolean) => void;

  map: MapState;
  setMapCamera: (center: [number, number], zoom: number) => void;
  setSelectedMovieId: (id: number | null) => void;
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
			// Onboarding
			hasOnboarded: false,
			setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),

			// Map
			map: {
				center: [2.5, 48.5],
				zoom: 8,
				selectedMovieId: null,
			},
			setMapCamera: (center, zoom) =>
				set(state => ({
					map: { ...state.map, center, zoom },
				})),
			setSelectedMovieId: (id) =>
				set(state => ({
					map: { ...state.map, selectedMovieId: id },
				})),

		}),
		{
			name: 'ui-storage',
			storage: createJSONStorage(() => zustandStorage),
		}
	)
);