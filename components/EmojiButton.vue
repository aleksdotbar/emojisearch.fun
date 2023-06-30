<script setup lang="ts">
defineProps<{ emoji: string }>()

const { copy, copied } = useClipboard()
</script>

<template>
  <UTooltip :text="copied ? 'Copied' : 'Copy'">
    <UButton variant="ghost" class="text-xl" square @click="copy(emoji)">
      {{ emoji }}
    </UButton>
  </UTooltip>
</template>
