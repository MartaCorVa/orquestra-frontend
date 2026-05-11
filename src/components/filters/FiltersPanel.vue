<template>
  <section>
    <div :class="['grid grid-cols-1 gap-4 md:grid-cols-2', columnsClass]">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  columnsClass?: string
}

withDefaults(defineProps<Props>(), {
  columnsClass: 'xl:grid-cols-4',
})
</script>