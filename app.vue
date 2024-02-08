<script setup lang="ts">
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
  themeColor: "#121212",
});

const route = useRoute();
const router = useRouter();

const params = reactive({
  query: computed({
    get: () => route.query.q?.toString().trim() ?? "",
    set: (q) => {
      router.push({ query: { q } });
    },
  }),
});

const {
  data,
  error,
  status,
  refresh: refetch,
} = useLazyFetch<Array<string>>("/api/completion", {
  params,
  server: false,
  immediate: !!params.query,
});

const pending = computed(() => status.value === "pending");

const inputRef = ref<ComponentPublicInstance>();

const input = computed(() => inputRef.value?.$el.firstChild as HTMLInputElement | undefined);

const onSubmit = async () => {
  const newQuery = input.value?.value.toString().trim();

  if (!newQuery) return;

  if (newQuery === params.query) {
    await refetch();
  } else {
    params.query = newQuery;
  }
};

watchEffect(
  () => {
    if (!pending.value) {
      input.value?.select();
    }
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
            <UInput :model-value="params.query" :loading="pending" ref="inputRef" size="xl">
              <template #leading>
                <span class="text-xs">🔍</span>
              </template>

              <template #trailing>
                <ClientOnly>
                  <span v-if="pending" class="text-xs animate-spin">⏳</span>
                </ClientOnly>
              </template>
            </UInput>
          </form>

          <div v-if="error" class="mt-6">
            <template v-if="error.statusCode === 429">
              <div class="text-2xl text-center">✋</div>
              <p class="mt-2 text-red-500 text-center">Woah! Hold up. Cool down for a bit.</p>
            </template>
            <template v-else>
              <div class="text-2xl text-center">😢</div>
              <p class="mt-2 text-red-500 text-center">Something's not right. Please try again.</p>
            </template>
          </div>

          <div
            v-else
            class="mt-6 grid grid-cols-6 sm:grid-cols-10 justify-items-center"
            ref="emojiGrid"
          >
            <EmojiButton v-for="emoji in data" :key="emoji" :emoji="emoji" class="grow-0" />
          </div>
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
  <NuxtPwaManifest />
</template>

<style>
#__nuxt {
  @apply h-full flex flex-col;
}

html {
  font-family: Chewy, "Chewy fallback";
}
</style>
