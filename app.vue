<script setup lang="ts">
import { useCompletion } from "ai/vue"

const { input, completion, isLoading, handleSubmit } = useCompletion()

const emojis = computed(() => splitEmojis(completion.value))
</script>

<template>
  <header
    class="backdrop-blur flex-none border-b border-gray-200 dark:border-gray-800 bg-white/75 dark:bg-gray-900/75"
  >
    <UContainer class="flex h-14 items-center">
      <div class="text-xl">🕵️‍♂️</div>
    </UContainer>
  </header>

  <UContainer as="main" class="mt-20">
    <div class="max-w-md mx-auto">
      <form @submit.prevent="handleSubmit">
        <UInput v-model="input" :loading="isLoading" size="md" autofocus>
          <template #leading>
            <span class="text-xs" :class="{ 'animate-spin': isLoading }">
              {{ isLoading ? "⏳" : "🔍" }}
            </span>
          </template>
        </UInput>
      </form>

      <div class="mt-6 grid grid-cols-10 justify-items-center">
        <EmojiButton v-for="emoji in emojis" :key="emoji" :emoji="emoji" class="grow-0" />
      </div>
    </div>
  </UContainer>
</template>
