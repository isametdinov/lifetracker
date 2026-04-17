<template>
  <div class="youtube-card">
    <div class="youtube-header">
      <h3>{{ uiStore.translate('quickYoutubeAccess') }}</h3>
      <p>{{ uiStore.translate('motivationDescription') }}</p>
    </div>

    <div class="youtube-list">
      <a v-for="video in videos" :key="video.title" :href="video.url" target="_blank" rel="noreferrer" class="youtube-item">
        <div>
          <strong>{{ video.title }}</strong>
          <p>{{ video.description }}</p>
        </div>
        <span>{{ uiStore.translate('go') }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
/*
  YouTube panel component exposes motivational videos.
  - Uses uiStore for translated labels
  - Provides quick links to focus playlists
*/
import { useUiStore } from '../stores/ui';

const uiStore = useUiStore();

const videos = [
  {
    title: 'Focus & Study Music',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    description: 'Lo-fi beats to help you stay calm and productive.',
  },
  {
    title: 'Motivational Workout Mix',
    url: 'https://www.youtube.com/watch?v=UceaB4D0jpo',
    description: 'High-energy music to keep your motivation high.',
  },
  {
    title: 'Deep Work Session',
    url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
    description: 'Focus music for long study or work blocks.',
  },
];
</script>
