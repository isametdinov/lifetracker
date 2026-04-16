<template>
  <!-- Main assistant card display for chat and task review -->
  <div class="assistant-card">
    <div class="assistant-header">
      <div>
        <h3>AI Productivity Coach</h3>
        <p>Chat with a Trinity-powered coach for focus, motivation, and task support.</p>
      </div>
      <span class="assistant-badge">Trinity AI</span>
    </div>

    <div class="assistant-body">
      <div v-if="reviewTask" class="assistant-review">
        <div class="assistant-summary">
          <strong>Task review</strong>
          <p>Tell me about "{{ reviewTask.title }}" to complete it.</p>
        </div>

        <div class="assistant-question">
          <strong>Question {{ currentQuestion + 1 }} of {{ questions.length }}</strong>
          <p>{{ questions[currentQuestion] }}</p>
          <textarea v-model="reviewAnswer" rows="4" placeholder="Type your answer here..."></textarea>
        </div>

        <button @click="submitAnswer">Submit Answer</button>

        <div v-if="assistantResponse" class="assistant-response">
          <strong>Review note</strong>
          <p>{{ assistantResponse }}</p>
        </div>
      </div>

      <div v-else>
        <div class="assistant-summary">
          <strong>Trinity Chat</strong>
          <p>Ask about productivity, planning, or how to improve your task flow.</p>
        </div>

        <div v-if="!chatLog.length && !assistantResponse" class="assistant-hint">
          <p>{{ activeAdvice }}</p>
        </div>

        <div class="assistant-chat">
          <div
            v-for="(message, index) in chatLog"
            :key="index"
            :class="['chat-message', message.role === 'user' ? 'user-message' : 'assistant-message']"
          >
            <strong>{{ message.role === 'user' ? 'You' : 'Assistant' }}</strong>
            <p>{{ message.content }}</p>
          </div>
        </div>

        <div class="assistant-actions">
          <input v-model="userPrompt" placeholder="Type a question for the AI assistant" @keyup.enter="generateAdvice" />
          <button :disabled="isLoading" @click="generateAdvice">
            {{ isLoading ? 'Thinking...' : 'Ask Assistant' }}
          </button>
        </div>

        <div v-if="assistantResponse && !chatLog.length" class="assistant-response">
          <strong>Assistant says</strong>
          <p>{{ assistantResponse }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import api from '../services/api';

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({ totalTasks: 0, totalMinutes: 0, averageFocus: 0, zoneBreakdown: [] }),
  },
  reviewTask: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['review-complete']);
const userPrompt = ref('');
const assistantResponse = ref('');
const isLoading = ref(false);
const chatLog = ref([]);
const currentQuestion = ref(0);
const reviewAnswer = ref('');
const reviewAnswers = ref([]);

const questions = [
  'What was the main result you achieved in this task?',
  'What part of the task went especially well?',
  'What was the biggest challenge you faced?',
  'What would you do differently next time?',
  'On a scale of 1-10, how focused did you feel while doing this task? Tell me why.',
];
// Questions used during task review mode when the assistant guides completion feedback

const activeAdvice = computed(() => {
  if (!props.summary || props.summary.totalTasks === 0) {
    return 'Start by logging your first task so the coach can personalize your recommendations.';
  }

  if (props.summary.averageFocus < 50) {
    return 'Try shorter task bursts and focus on one zone at a time. Reduce distractions and celebrate small wins.';
  }

  if (props.summary.totalMinutes >= 180 && props.summary.averageFocus >= 70) {
    return 'You are doing well. Keep the momentum, but remember to take short breaks and hydrate.';
  }

  if (props.summary.zoneBreakdown.some((zone) => zone.zone === 'Home')) {
    return 'Use home as a recovery zone, and switch to productivity zones for important work sessions.';
  }

  return 'Your progress looks solid. Keep consistent task tracking and prioritize top tasks first.';
});

// ====COMENT====
// Main frontend action: send the user prompt to the backend assistant API,
// append messages to the local chat log, and display the AI response.
const generateAdvice = async () => {
  const prompt = userPrompt.value.trim();
  if (!prompt) {
    assistantResponse.value = 'Ask something specific about focus, motivation, or study routines to get a tailored tip.';
    return;
  }

  chatLog.value.push({ role: 'user', content: prompt });
  userPrompt.value = '';
  assistantResponse.value = '';
  isLoading.value = true;

  try {
    const response = await api.post('/assistant/chat', {
      prompt,
      history: chatLog.value,
    });

    const message = response.data?.message || 'I could not get a response from the AI assistant at this time.';
    chatLog.value.push({ role: 'assistant', content: message });
    assistantResponse.value = message;
  } catch (error) {
    assistantResponse.value =
      error?.response?.data?.message || 'AI service unavailable. Please check your server or Trinity API settings.';
  } finally {
    isLoading.value = false;
  }
};

// Handle the task review flow: collect answers, advance questions, and emit completion when done.
const submitAnswer = () => {
  if (!reviewAnswer.value.trim()) {
    assistantResponse.value = 'Please answer the current question before continuing.';
    return;
  }

  reviewAnswers.value.push(reviewAnswer.value.trim());
  reviewAnswer.value = '';

  if (currentQuestion.value < questions.length - 1) {
    currentQuestion.value += 1;
    assistantResponse.value = '';
    return;
  }

  assistantResponse.value = 'Great work! Your review is complete. Marking the task as finished now.';
  emit('review-complete', { taskId: props.reviewTask.id, answers: reviewAnswers.value });
};

watch(
  () => props.reviewTask,
  (task) => {
    if (task) {
      currentQuestion.value = 0;
      reviewAnswer.value = '';
      reviewAnswers.value = [];
      assistantResponse.value = '';
      chatLog.value = [];
    }
  }
);
</script>
