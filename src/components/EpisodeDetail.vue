<template>
  <div class="episode-detail">
    <div v-if="!episode" class="no-episode">
      <p>Keine Episode ausgewählt</p>
    </div>

    <div v-else class="detail-content">
      <div class="detail-header">
        <button @click="$emit('show-list')" class="back-btn">
          ← Episode List
        </button>
        <h2>{{ episode.title }}</h2>
      </div>

      <div class="episode-info">
        <p class="episode-number">Episode {{ episode.episodeNumber }}</p>
      </div>

      <div class="player-controls">
        <audio
          ref="audioElement"
          @timeupdate="updatePlaybackPosition"
          @ended="handleAudioEnded"
          @loadedmetadata="updateDuration"
        >
          <source :src="episode.audioUrl" type="audio/mpeg" />
          Ihr Browser unterstützt das HTML5 audio-Element nicht.
        </audio>

        <div class="progress-container">
          <span class="time">{{ formatTime(currentTime) }}</span>
          <input
            type="range"
            min="0"
            :max="duration"
            :value="currentTime"
            @change="seek"
            class="progress-bar"
          />
          <span class="time">{{ formatTime(duration) }}</span>
        </div>

        <div class="buttons">
          <button @click="rewind" class="control-btn" title="Rückwärts spulen">
            -30s
          </button>
          <button @click="togglePlay" class="play-btn" :title="isPlaying ? 'Pause' : 'Wiedergabe'">
            {{ isPlaying ? '⏸' : '▶' }}
          </button>
          <button @click="forward" class="control-btn" title="Vorwärts spulen">
            +30s
          </button>
        </div>

        <div class="playback-rate">
          <label>Wiedergabegeschwindigkeit:</label>
          <select @change="changePlaybackRate" :value="playbackRate">
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>

      <div class="navigation-buttons">
        <button 
          @click="$emit('previous-episode')" 
          class="nav-btn"
          :disabled="episodeIndex === 0"
          title="Vorherige Episode"
        >
          ←
        </button>
        <div class="episode-counter">
          {{ episodeIndex + 1 }} / {{ episodesCount }}
        </div>
        <button 
          @click="$emit('next-episode')" 
          class="nav-btn"
          :disabled="episodeIndex >= episodesCount - 1"
          title="Nächste Episode"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Episode } from '../services/feedService'
import { usePlaybackStore } from '../stores/playbackStore'

const props = defineProps<{
  episode: Episode | undefined
  currentEpisodeId: string | null
  episodeIndex: number
  episodesCount: number
}>()

const emit = defineEmits<{
  'episode-played': [episodeId: string]
  'next-episode': []
  'previous-episode': []
  'show-list': []
}>()

const playbackStore = usePlaybackStore()
const audioElement = ref<HTMLAudioElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref('1')

watch(() => props.episode, (newEpisode) => {
  if (newEpisode && audioElement.value) {
    audioElement.value.src = newEpisode.audioUrl
    // Start from beginning (we don't store time positions)
    audioElement.value.currentTime = 0
    currentTime.value = 0
    isPlaying.value = false
  }
}, { immediate: true })

const togglePlay = () => {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
    if (props.episode) playbackStore.setCurrentEpisode(props.episode.id)
  }
  isPlaying.value = !isPlaying.value
}

const rewind = () => {
  if (audioElement.value) {
    audioElement.value.currentTime = Math.max(0, audioElement.value.currentTime - 30)
  }
}

const forward = () => {
  if (audioElement.value) {
    audioElement.value.currentTime = Math.min(duration.value, audioElement.value.currentTime + 30)
  }
}

const seek = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (audioElement.value) {
    audioElement.value.currentTime = parseFloat(target.value)
  }
}

const updatePlaybackPosition = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
    // We no longer store time positions — do not persist currentTime
  }
}

const updateDuration = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

const handleAudioEnded = () => {
  isPlaying.value = false
  if (props.episode) {
    emit('episode-played', props.episode.id)
  }
}

const changePlaybackRate = (event: Event) => {
  const target = event.target as HTMLSelectElement
  playbackRate.value = target.value
  if (audioElement.value) {
    audioElement.value.playbackRate = parseFloat(target.value)
  }
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.episode-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.no-episode {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.detail-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.5rem;
}

.detail-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-shrink: 0;
}

.back-btn {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.back-btn:hover {
  background: #357abd;
}

.detail-header h2 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.3;
  word-break: break-word;
}

.episode-info {
  flex-shrink: 0;
}

.episode-number {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #4a90e2;
  font-size: 1rem;
}

.player-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  flex-shrink: 0;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.time {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  min-width: 3rem;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  appearance: none;
}

.progress-bar::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #4a90e2;
  cursor: pointer;
}

.progress-bar::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #4a90e2;
  cursor: pointer;
  border: none;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}

.control-btn {
  padding: 0.75rem 1rem;
  background: rgba(74, 144, 226, 0.3);
  color: #4a90e2;
  border: 1px solid #4a90e2;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  font-weight: 600;
}

.control-btn:hover {
  background: #4a90e2;
  color: white;
}

.play-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4a90e2;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.play-btn:hover {
  background: #357abd;
  transform: scale(1.05);
}

.playback-rate {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
}

.playback-rate label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.playback-rate select {
  padding: 0.5rem 0.75rem;
  background: rgba(74, 144, 226, 0.2);
  color: #4a90e2;
  border: 1px solid #4a90e2;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.navigation-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 0.75rem 0.5rem;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s;
  min-width: 44px;
}

.nav-btn:hover:not(:disabled) {
  background: #357abd;
}

.nav-btn:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.episode-counter {
  padding: 0.5rem 1rem;
  background: rgba(74, 144, 226, 0.2);
  border-radius: 4px;
  font-size: 0.95rem;
  color: #4a90e2;
  font-weight: 600;
  min-width: 80px;
  text-align: center;
}
</style>
