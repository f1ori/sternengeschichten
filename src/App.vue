<template>
  <div id="app" class="app">
    <template v-if="isLoading">
      <div class="loading-state">
        <button @click="refreshFeed" class="load-btn" :disabled="isRefreshing">
          {{ isRefreshing ? 'Wird geladen...' : 'Episoden laden' }}
        </button>
      </div>
    </template>

    <template v-else-if="error">
      <div class="error-state">
        <p>Fehler: {{ error }}</p>
        <button @click="refreshFeed" class="load-btn">Erneut versuchen</button>
      </div>
    </template>

    <template v-else>
      <header class="app-header">
        <h1>⭐ Sternengeschichten</h1>
        <button @click="refreshFeed" class="refresh-btn" :disabled="isRefreshing" title="Feed aktualisieren">
          ↻
        </button>
      </header>

      <div class="app-content">
        <div v-if="episodes.length === 0" style="padding: 2rem; color: white;">
          <p>No episodes loaded. Episodes count: {{ episodes.length }}</p>
          <p>Selected Episode ID: {{ playbackStore.selectedEpisodeId }}</p>
          <button @click="refreshFeed" class="load-btn">Load Episodes</button>
        </div>

        <EpisodeDetail 
          v-else-if="currentView === 'detail'"
          :episode="selectedEpisode"
          :currentEpisodeId="currentEpisodeId"
          :episodeIndex="episodeIndex"
          :episodesCount="episodes.length"
          @episode-played="markEpisodePlayed"
          @next-episode="goToNextEpisode"
          @previous-episode="goToPreviousEpisode"
          @show-list="currentView = 'list'"
        />
        
        <EpisodeList 
          v-else-if="currentView === 'list'"
          :episodes="episodes"
          :currentEpisodeId="currentEpisodeId"
          @select="selectAndGoToDetail"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePodcastStore } from './stores/podcastStore'
import { usePlaybackStore } from './stores/playbackStore'
import { fetchPodcastFeed } from './services/feedService'
import EpisodeDetail from './components/EpisodeDetail.vue'
import EpisodeList from './components/EpisodeList.vue'

const podcastStore = usePodcastStore()
const playbackStore = usePlaybackStore()

const isRefreshing = ref(false)
const isLoading = ref(true)
const error = ref<string | null>(null)
const currentView = ref<'detail' | 'list'>('detail')

const episodes = computed(() => podcastStore.episodes)
const currentEpisodeId = computed(() => playbackStore.currentEpisodeId)

const episodeIndex = computed(() => {
  const index = episodes.value.findIndex(ep => ep.id === playbackStore.selectedEpisodeId)
  return index >= 0 ? index : 0
})

const selectedEpisode = computed(() => {
  return episodes.value.find(ep => ep.id === playbackStore.selectedEpisodeId)
})

const selectEpisode = (episodeId: string) => {
  playbackStore.selectEpisode(episodeId)
}

const selectAndGoToDetail = (episodeId: string) => {
  selectEpisode(episodeId)
  currentView.value = 'detail'
}

const goToNextEpisode = () => {
  const nextIndex = episodeIndex.value + 1
  if (nextIndex < episodes.value.length) {
    selectEpisode(episodes.value[nextIndex].id)
  }
}

const goToPreviousEpisode = () => {
  const prevIndex = episodeIndex.value - 1
  if (prevIndex >= 0) {
    selectEpisode(episodes.value[prevIndex].id)
  }
}

const markEpisodePlayed = (episodeId: string) => {
  playbackStore.markEpisodePlayed(episodeId)
}

const refreshFeed = async () => {
  isRefreshing.value = true
  try {
    const feed = await fetchPodcastFeed()
    podcastStore.setEpisodes(feed.episodes)
  } catch (error) {
    console.error('Failed to refresh feed:', error)
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Try to load from cache first
    const cachedEpisodes = await podcastStore.loadFromCache()
    
    if (!cachedEpisodes || cachedEpisodes.length === 0) {
      // Fetch from network if no cache
      await refreshFeed()
    }

    // Restore playback state
    await playbackStore.restore()

    // Default to first episode if nothing selected yet
    if (episodes.value.length > 0 && !playbackStore.selectedEpisodeId) {
      selectEpisode(episodes.value[0].id)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    console.error('Failed to load app:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.app-header h1 {
  margin: 0;
  font-size: 1.2rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #357abd;
}

.refresh-btn:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.app-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 2rem;
  text-align: center;
}

.loading-state p,
.error-state p {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.load-btn {
  padding: 1rem 2rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.load-btn:hover:not(:disabled) {
  background: #357abd;
}

.load-btn:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
