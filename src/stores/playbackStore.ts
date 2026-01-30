import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'sternengeschichten_playback'

export const usePlaybackStore = defineStore('playback', () => {
  const currentEpisodeId = ref<string | null>(null)
  const selectedEpisodeId = ref<string | null>(null)
  const playedEpisodes = ref<Set<string>>(new Set())

  const selectEpisode = (episodeId: string) => {
    selectedEpisodeId.value = episodeId
    // Remember the last displayed episode immediately (even if not played)
    currentEpisodeId.value = episodeId
    saveToStorage()
  }

  const markEpisodePlayed = (episodeId: string) => {
    currentEpisodeId.value = episodeId
    playedEpisodes.value.add(episodeId)
    // Save to localStorage
    saveToStorage()
  }

  // Remember only the episode id (no time positions)
  const setCurrentEpisode = (episodeId: string) => {
    currentEpisodeId.value = episodeId
    saveToStorage()
  }

  // Backwards-compatible alias (accepts only episodeId now)
  const updatePlaybackPosition = (episodeId: string) => {
    setCurrentEpisode(episodeId)
  }

  const saveToStorage = () => {
    const data = {
      currentEpisodeId: currentEpisodeId.value,
      playedEpisodes: Array.from(playedEpisodes.value)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const restore = async () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored)
        currentEpisodeId.value = data.currentEpisodeId
        playedEpisodes.value = new Set(data.playedEpisodes || [])
        // Ensure the UI selects the last displayed episode after restoring
        if (currentEpisodeId.value && !selectedEpisodeId.value) {
          selectedEpisodeId.value = currentEpisodeId.value
        }
      } catch (error) {
        console.error('Failed to restore playback state:', error)
      }
    }
  }

  return {
    currentEpisodeId,
    selectedEpisodeId,
    playedEpisodes,
    selectEpisode,
    markEpisodePlayed,
    setCurrentEpisode,
    updatePlaybackPosition,
    restore
  }
})
