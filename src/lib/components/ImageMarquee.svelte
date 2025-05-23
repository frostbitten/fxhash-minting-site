<!-- src/lib/components/ImageMarquee.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    
    // Props with defaults
    export let imageCount = 5;
    export let images = [];
    export let animationDuration = 30; // in seconds
    
    let visibleImages = [];
    
    onMount(() => {
      // Get the first 'imageCount' images, or all if less than imageCount
      if (images.length > 0) {
        visibleImages = images.slice(0, Math.min(imageCount, images.length));
      }
    });
  </script>
  
  <style lang="scss">
    
    @reference "tailwindcss";

    .marquee-container {
      @apply w-full overflow-hidden;
    }
    
    .marquee {
      @apply flex items-center;
      animation: marquee var(--duration) linear infinite;
      
      .image-item {
        @apply flex-shrink-0;// px-4;
      }
    }
    
    @keyframes marquee {
      0% {
        transform: translateX(0);
      }
      100% {
        // Transform to the negative width of the first set of images
        transform: translateX(-50%);
      }
    }
  </style>
  
  <div class="marquee-container">
    <div class="marquee" style="--duration: {animationDuration}s">
      {#each Array.from({length:3}) as i}
        {#each visibleImages as image}
            <div class="image-item">
            <img src={image.url} alt={image.filename} class="h-32 w-32" />
            </div>
        {/each}
      {/each}
    </div>
  </div>