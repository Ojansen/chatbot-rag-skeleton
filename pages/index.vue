<template>
  <main class="container mx-auto h-full p-8 max-w-4xl flex gap-4 flex-col">
    <div class="grow overflow-y-auto rounded-xl">
      <div v-for="message in messages" :key="message.id">
        <div class="chat" v-if="message.text.length"
             :class="[message.sender === 'Bot' ? 'chat-start' : 'chat-end']"
        >
          <div class="chat-bubble prose"
               :class="[message.sender === 'Bot' ? 'chat-bubble text-white' : 'chat-bubble-primary text-white']" v-html="marked.parse(message.text)">
          </div>
          <div class="chat-footer opacity-50">{{ message.sender }} at {{ new Date(message.id).toLocaleString() }} <span v-if="message.faithful">{{message.failtful}}</span> </div>
        </div>
      </div>
      <div class="chat chat-start" v-if="loading">
        <div class="chat-bubble">
          <Icon name="svg-spinners:3-dots-bounce" class="size-4 text-white"/>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <p v-if="messages.length === 0">Start a conversation by writing your first message</p>
      <div class="flex gap-4">
        <input
            placeholder="Message"
            :disabled="loading"
            type="text"
            class="w-full rounded-xl py-2 px-4 disabled:bg-gray-700"
            @keyup.enter="sendMessage"
            v-model="prompt"/>
        <button class="btn btn-primary text-white" type="button" @click="sendMessage">
          Verstuur <Icon name="mdi:arrow-up" class="size-4"/>
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { marked } from 'marked';

const prompt = ref('');
const messages = ref<Record<string, any>>([]);
const loading = ref(false);
const faithful = ref('');

async function sendMessage() {
  loading.value = true;
  messages.value.push({
    id: Date.now(),
    sender: 'User',
    text: prompt.value,
    faithful: undefined
  });

  const response = await $fetch('/api/chat', {
    method: 'POST',
    body: { prompt: prompt.value }
  });

  prompt.value = '';
  loading.value = false;

  messages.value.push({
    id: Date.now() + 1,
    sender: 'Bot',
    text: response.response.message.content,
    faithful: response.faithful.passing ? 'faithful' : 'not faithful',
  });
}
</script>
