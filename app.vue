<script setup lang="ts">
import { useCompletion } from "ai/vue"

useSeoMeta({
  title: "AI-powered Emoji Search",
  ogTitle: "AI-powered Emoji Search",
  description: "Find emojis for any context",
  ogDescription: "Find emojis for any context",
  ogSiteName: "emojisearch.fun",
})

const { input, completion, isLoading, error, handleSubmit } = useCompletion()

const emojis = computed(() => splitEmojis(completion.value))

const onSubmit = (e: Event) => {
  error.value = undefined
  input.value = input.value.trim()

  if (input.value) {
    handleSubmit(e)
  }
}
</script>

<template>
  <Html>
    <Head>
      <Link
        rel="icon"
        href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕵️‍♂️</text></svg>"
      />
    </Head>
    <Body class="font-[Chewy] min-w-[320px]">
      <header
        class="backdrop-blur flex-none border-b border-gray-200 dark:border-gray-800 bg-white/75 dark:bg-gray-900/75"
      >
        <UContainer class="flex h-14 items-center justify-between">
          <div class="text-xl">🕵️‍♂️</div>

          <NuxtLink to="https://github.com/xanderbarkhatov/emojisearch" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 15 15">
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M7.5.25a7.25 7.25 0 0 0-2.292 14.13c.363.066.495-.158.495-.35c0-.172-.006-.628-.01-1.233c-2.016.438-2.442-.972-2.442-.972c-.33-.838-.805-1.06-.805-1.06c-.658-.45.05-.441.05-.441c.728.051 1.11.747 1.11.747c.647 1.108 1.697.788 2.11.602c.066-.468.254-.788.46-.969c-1.61-.183-3.302-.805-3.302-3.583a2.8 2.8 0 0 1 .747-1.945c-.075-.184-.324-.92.07-1.92c0 0 .61-.194 1.994.744A6.963 6.963 0 0 1 7.5 3.756A6.97 6.97 0 0 1 9.315 4c1.384-.938 1.992-.743 1.992-.743c.396.998.147 1.735.072 1.919c.465.507.745 1.153.745 1.945c0 2.785-1.695 3.398-3.31 3.577c.26.224.492.667.492 1.343c0 .97-.009 1.751-.009 1.989c0 .194.131.42.499.349A7.25 7.25 0 0 0 7.499.25Z"
                clip-rule="evenodd"
              />
            </svg>
          </NuxtLink>
        </UContainer>
      </header>

      <UContainer as="main" class="mt-36 sm:mt-52">
        <h1 class="text-4xl md:text-6xl text-center font-medium">
          Find <span class="text-yellow-400">emojis</span> for any context
        </h1>

        <div class="mt-16 max-w-md mx-auto">
          <form @submit.prevent="onSubmit">
            <UInput v-model="input" :loading="isLoading" size="xl" autofocus>
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

          <div v-else class="mt-6 grid grid-cols-6 sm:grid-cols-10 justify-items-center">
            <EmojiButton v-for="emoji in emojis" :key="emoji" :emoji="emoji" class="grow-0" />
          </div>
        </div>
      </UContainer>
    </Body>
  </Html>
</template>
