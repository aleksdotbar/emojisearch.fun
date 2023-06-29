<script setup lang="ts">
defineProps<{ emoji: string }>()

const { copy, copied } = useClipboard()
</script>

<template>
  <UTooltip :text="copied ? 'Copied' : 'Copy'">
    <UButton
      variant="ghost"
      class="w-8 h-8 flex items-center justify-center"
      square
      @click="copy(emoji)"
    >
      {{ emoji }}
    </UButton>
  </UTooltip>
</template>
