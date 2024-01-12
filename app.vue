<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";

useServerSeoMeta({
  title: "AI-powered Emoji Search",
  description: "Find emojis for any context",
  ogSiteName: "emojisearch.fun",
  ogTitle: "emojisearch.fun",
  ogDescription: "AI-powered Emoji Search",
  ogImage: "https://emojisearch.fun/og.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: "image/png",
  twitterImage: "https://emojisearch.fun/og.png",
  twitterCard: "summary_large_image",
  twitterTitle: "emojisearch.fun",
  twitterDescription: "AI-powered Emoji Search",
  twitterCreator: "@xanderbarkhatov",
});

const route = useRoute();

const prompt = computed(() => route.query.prompt?.toString().trim());

const params = reactive({ prompt });

const { data, error, isLoading } = useQuery({
  queryKey: ["emojis", params],
  queryFn: () => $fetch("/api/completion", { params }),
  enabled: () => !!prompt.value,
});

const sizer = ref<HTMLSpanElement>();

const router = useRouter();

const onSubmit = async (e: Event) => {
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const newPrompt = formData.get("prompt")?.toString().trim();

  if (newPrompt && newPrompt !== prompt.value) {
    await router.push({ query: { prompt: newPrompt } });
  }
};

const input = ref<ComponentPublicInstance>();

whenever(
  logicNot(isLoading),
  () => {
    input.value?.$el.firstChild.select();
  },
  { flush: "post" }
);
</script>

<template>
  <Html class="h-full">
    <Body class="min-w-[320px] flex flex-col h-full">
      <UContainer as="main" class="mt-36 sm:mt-60 flex-1">
        <h1 class="text-4xl md:text-6xl text-center font-medium">
          Find <span class="text-yellow-400">emojis</span> for any context
        </h1>

        <div class="mt-16 max-w-md mx-auto">
          <form @submit.prevent="onSubmit">
            <UInput
              :model-value="prompt"
              :loading="isLoading"
              ref="input"
              name="prompt"
              size="xl"
              autofocus
            >
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

          <div
            v-else-if="!isLoading"
            class="mt-6 grid grid-cols-6 sm:grid-cols-10 justify-items-center"
            ref="emojiGrid"
          >
            <EmojiButton v-for="emoji in emojis" :key="emoji" :emoji="emoji" class="grow-0" />
          </div>

          <span class="w-auto" aria-hidden="true" ref="sizer"></span>
        </div>
      </UContainer>

      <footer>
        <UContainer class="mt-16 mb-8">
          <div class="text-center text-gray-400">
            Made with 💚 by
            <NuxtLink
              to="https://xanderbarkhatov.com"
              target="_blank"
              class="text-sky-500 hover:underline"
              external
            >
              xanderbarkhatov
            </NuxtLink>
          </div>
        </UContainer>
      </footer>
    </Body>
  </Html>
</template>

<style>
#__nuxt {
  @apply h-full flex flex-col;
}

html {
  font-family: Chewy, "Chewy fallback";
}
</style>
