<template>
  <div class="episode-list-container">
    <div class="list-header">
      <h2>Episodes</h2>
      <button @click="$emit('select', currentEpisodeId)" v-if="currentEpisodeId" class="back-btn">
        ← Back to Playing
      </button>
    </div>

    <div class="search-filters">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by episode # or title..."
        class="search-input"
      />
    </div>

    <div class="episode-list">
      <div v-if="filteredEpisodes.length === 0" class="empty-state">
        <p v-if="episodes.length === 0">No episodes found. Refresh feed?</p>
        <p v-else>No episodes match your search.</p>
      </div>

      <div v-for="episode in filteredEpisodes" :key="episode.id" class="episode-item" :class="{ active: episode.id === currentEpisodeId }">
        <button @click="$emit('select', episode.id)" class="episode-button">
          <div class="episode-header">
            <div class="episode-number">{{ episode.episodeNumber }}</div>
            <div class="episode-title">{{ episode.title }}</div>
          </div>
          <div class="episode-meta">
            <span class="date">{{ formatDate(episode.pubDate) }}</span>
            <span v-if="isEpisodePlayed(episode.id)" class="played-badge">✓ Played</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Episode } from '../services/feedService'
import { usePlaybackStore } from '../stores/playbackStore'

const props = defineProps<{
  episodes: Episode[]
  currentEpisodeId: string | null
}>()

defineEmits<{
  select: [episodeId: string]
}>()

const playbackStore = usePlaybackStore()
const searchQuery = ref('')

const filteredEpisodes = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.episodes
  }

  const query = searchQuery.value.toLowerCase().trim()
  return props.episodes.filter(episode => {
    const episodeNum = episode.episodeNumber?.toLowerCase() || ''
    const title = episode.title.toLowerCase()
    return episodeNum.includes(query) || title.includes(query)
  })
})

const isEpisodePlayed = (episodeId: string): boolean => {
  return playbackStore.playedEpisodes.has(episodeId)
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { year: '2-digit', month: '2-digit', day: '2-digit' })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.episode-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
  flex: 1;
}

.list-header {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.list-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
  white-space: nowrap;
}

.back-btn:hover {
  background: #357abd;
}

.search-filters {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: #4a90e2;
}

.episode-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 2rem;
}

.empty-state p {
  margin: 0;
}

.episode-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}

.episode-item.active {
  background: rgba(74, 144, 226, 0.2);
}

.episode-button {
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s;
  display: block;
}

.episode-button:hover {
  background: rgba(255, 255, 255, 0.05);
}

.episode-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.episode-number {
  font-weight: 600;
  min-width: 4rem;
  color: #4a90e2;
}

.episode-title {
  flex: 1;
  line-height: 1.3;
  word-break: break-word;
  font-size: 0.95rem;
}

.episode-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  padding-left: 4.75rem;
  align-items: center;
}

.date {
  font-weight: 500;
}

.played-badge {
  padding: 0.25rem 0.5rem;
  background: #2ecc71;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}
</style>
