import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface PlaybackPosition {
  episodeId: string
  position: number
  timestamp: number
}

const STORAGE_KEY = 'sternengeschichten_playback'

export const usePlaybackStore = defineStore('playback', () => {
  const currentEpisodeId = ref<string | null>(null)
  const selectedEpisodeId = ref<string | null>(null)
  const playbackPositions = ref<Map<string, PlaybackPosition>>(new Map())
  const playedEpisodes = ref<Set<string>>(new Set())

  const getCurrentPlaybackPosition = computed(() => {
    if (!selectedEpisodeId.value) return 0
    return playbackPositions.value.get(selectedEpisodeId.value)?.position ?? 0
  })

  const selectEpisode = (episodeId: string) => {
    selectedEpisodeId.value = episodeId
  }

  const markEpisodePlayed = (episodeId: string) => {
    currentEpisodeId.value = episodeId
    playedEpisodes.value.add(episodeId)
    // Save to localStorage
    saveToStorage()
  }

  const updatePlaybackPosition = (episodeId: string, position: number) => {
    playbackPositions.value.set(episodeId, {
      episodeId,
      position,
      timestamp: Date.now()
    })
    saveToStorage()
  }

  const saveToStorage = () => {
    const data = {
      currentEpisodeId: currentEpisodeId.value,
      playbackPositions: Array.from(playbackPositions.value.entries()),
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
        playbackPositions.value = new Map(data.playbackPositions || [])
        playedEpisodes.value = new Set(data.playedEpisodes || [])
      } catch (error) {
        console.error('Failed to restore playback state:', error)
      }
    }
  }

  return {
    currentEpisodeId,
    selectedEpisodeId,
    playbackPositions,
    playedEpisodes,
    getCurrentPlaybackPosition,
    selectEpisode,
    markEpisodePlayed,
    updatePlaybackPosition,
    restore
  }
})
