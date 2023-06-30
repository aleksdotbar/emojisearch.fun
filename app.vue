<script setup lang="ts">
import { useCompletion } from "ai/vue"

const { input, completion, isLoading, error, handleSubmit } = useCompletion()

const emojis = computed(() => splitEmojis(completion.value))

const onSubmit = (e: Event) => {
  error.value = undefined
  handleSubmit(e)
}
</script>

<template>
  <Html>
    <Body class="font-[Chewy]">
      <header
        class="backdrop-blur flex-none border-b border-gray-200 dark:border-gray-800 bg-white/75 dark:bg-gray-900/75"
      >
        <UContainer class="flex h-14 items-center">
          <div class="text-xl">🕵️‍♂️</div>
        </UContainer>
      </header>

      <UContainer as="main" class="fixed top-1/4 inset-x-0">
        <h1 class="text-4xl md:text-6xl text-center font-medium">
          Find <span class="text-yellow-400">emojis</span> for any context
        </h1>

        <div class="mt-20 max-w-md mx-auto">
          <form @submit.prevent="onSubmit">
            <UInput v-model="input" :loading="isLoading" size="md" autofocus>
              <template #leading>
                <span class="text-xs" :class="{ 'animate-spin': isLoading }">
                  {{ isLoading ? "⏳" : "🔍" }}
                </span>
              </template>
            </UInput>
          </form>

          <div v-if="error" class="mt-6">
            <div class="text-2xl text-center">😢</div>
            <p class="mt-2 text-red-500 text-center">Something's not right. Please try again.</p>
          </div>

          <div v-else class="mt-6 grid grid-cols-10 justify-items-center">
            <EmojiButton v-for="emoji in emojis" :key="emoji" :emoji="emoji" class="grow-0" />
          </div>
        </div>
      </UContainer>
    </Body>
  </Html>
</template>
