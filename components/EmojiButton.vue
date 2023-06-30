<script setup lang="ts">
const props = defineProps<{ emoji: string }>()

const DELAY = 1500

const { copy, copied } = useClipboard({ copiedDuring: DELAY })

const [isShowing, setIsShowing] = useToggle(true)

const { start } = useTimeoutFn(() => setIsShowing(false), DELAY, { immediate: false })

const onClick = () => {
  copy(props.emoji)
  setIsShowing(true)
  start()
}
</script>

<template>
  <UTooltip
    :text="copied ? 'Copied' : 'Copy'"
    :prevent="!isShowing"
    @mouseleave="setIsShowing(true)"
  >
    <UButton variant="ghost" class="text-xl" square @click="onClick">
      {{ emoji }}
    </UButton>
  </UTooltip>
</template>
