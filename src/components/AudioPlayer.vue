<template>
  <div class="audio-player">
    <div v-if="!episode" class="no-episode">
      <p>Keine Episode ausgewählt</p>
    </div>

    <div v-else class="player-content">
      <div class="episode-info">
        <h2>{{ episode.title }}</h2>
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
          <button @click="togglePlay" class="play-btn" :title="(isPlaying ? 'Pause' : 'Wiedergabe') + '\n\n' + episode.description">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Episode } from '../services/feedService'
import { usePlaybackStore } from '../stores/playbackStore'

const props = defineProps<{
  episode: Episode | undefined
}>()

const emit = defineEmits<{
  'episode-played': [episodeId: string]
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
  }
}, { immediate: true })

const togglePlay = () => {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
    // Remember which episode is currently playing (no time position)
    if (props.episode) playbackStore.setCurrentEpisode(props.episode.id)
  }
  isPlaying.value = !isPlaying.value
}

const updatePlaybackPosition = () => {
  if (!audioElement.value) return
  currentTime.value = audioElement.value.currentTime
  // We no longer store time positions — do not persist currentTime
}

const updateDuration = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

const seek = (e: Event) => {
  const input = e.target as HTMLInputElement
  const newTime = parseFloat(input.value)
  if (audioElement.value) {
    audioElement.value.currentTime = newTime
    currentTime.value = newTime
  }
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

const changePlaybackRate = (e: Event) => {
  const select = e.target as HTMLSelectElement
  const rate = parseFloat(select.value)
  playbackRate.value = select.value
  if (audioElement.value) {
    audioElement.value.playbackRate = rate
  }
}

const handleAudioEnded = () => {
  isPlaying.value = false
  if (props.episode) {
    emit('episode-played', props.episode.id)
  }
}

const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  if (audioElement.value) {
    audioElement.value.playbackRate = parseFloat(playbackRate.value)
  }
})
</script>

<style scoped>
.audio-player {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
}

.no-episode {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.player-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.episode-info {
  margin-bottom: 2rem;
  flex: 1;
  overflow-y: auto;
}

.episode-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  line-height: 1.3;
}

.episode-number {
  color: #4a90e2;
  font-weight: 600;
  margin: 0.5rem 0 1rem 0;
  font-size: 0.9rem;
}



.player-controls {
  flex-shrink: 0;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.time {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  min-width: 3rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4a90e2;
  cursor: pointer;
}

.progress-bar::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4a90e2;
  cursor: pointer;
  border: none;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.control-btn,
.play-btn {
  background: rgba(74, 144, 226, 0.2);
  border: 1px solid #4a90e2;
  color: #4a90e2;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.control-btn:hover,
.play-btn:hover {
  background: rgba(74, 144, 226, 0.3);
}

.play-btn {
  width: 60px;
  height: 60px;
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
  font-size: 1.2rem;
}

.play-btn:hover {
  background: #357abd;
  border-color: #357abd;
}

.playback-rate {
  text-align: center;
}

.playback-rate label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.playback-rate select {
  padding: 0.5rem;
  background: rgba(74, 144, 226, 0.15);
  border: 1px solid #4a90e2;
  color: #4a90e2;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.playback-rate select:hover {
  background: rgba(74, 144, 226, 0.25);
}

audio {
  display: none;
}
</style>
