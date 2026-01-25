import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Episode } from '../services/feedService'
import { getCachedFeed } from '../services/feedService'

export const usePodcastStore = defineStore('podcast', () => {
  const episodes = ref<Episode[]>([])

  const episodeCount = computed(() => episodes.value.length)

  const getEpisodeById = (id: string) => {
    return episodes.value.find(ep => ep.id === id)
  }

  const setEpisodes = (newEpisodes: Episode[]) => {
    episodes.value = newEpisodes
  }

  const loadFromCache = async () => {
    const cached = await getCachedFeed()
    if (cached && cached.episodes) {
      episodes.value = cached.episodes
      return cached.episodes
    }
    return null
  }

  return {
    episodes,
    episodeCount,
    getEpisodeById,
    setEpisodes,
    loadFromCache
  }
})
