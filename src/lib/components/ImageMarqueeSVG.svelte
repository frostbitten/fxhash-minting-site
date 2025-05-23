<!-- src/lib/components/ImageMarqueeSVG.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    
    // Props with defaults
    export let images = [];
    export let animationDuration = 30; // in seconds
    export let id = '';
    export let imageSize = 420;
    export let imageCount = 5;
    
    let container;
    
    let visibleImages = [];
    let displayImages = [];
    let containerWidth = 0;

    
    onMount(() => {
      // Get the first 'imageCount' images, or all if less than imageCount
      if (images.length > 0) {
        // visibleImages = images.slice(0, Math.min(imageCount, images.length));
        visibleImages = images.slice(0, images.length);

        displayImages = [];
        for(let i = 0; i < 6; i++) {
            displayImages = displayImages.concat(visibleImages);
        }
        
        containerWidth = visibleImages.length * imageSize; // Each image is 100px wide
        
        if (id) {
          container.id = id;
        }
      }
    });
</script>
  
<style lang="scss">
  @reference "tailwindcss";
  
  .marquee {
    animation: marquee var(--duration) linear infinite;
  }
  
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(calc(var(--container-width) * -1));
    }
  }
</style>

<!-- Define patterns for each image -->
<!-- <defs>
  {#each visibleImages as image, i}
    <pattern id={patternIds[i]} patternUnits="userSpaceOnUse" width="100" height="100">
      <image href={image.url} width="100" height="100" preserveAspectRatio="xMidYMid slice" />
    </pattern>
  {/each}
</defs> -->
  
<g class="marquee-container" bind:this={container} data-images={images.length}>
    <g class="marquee" style="--duration: {animationDuration}s; --container-width: {containerWidth}px;">
        {#each displayImages as image, i}
            <!-- <rect width="100" height="100" x="{i * 100}" y="0" fill={`url(#image-pattern-${i%visibleImages.length})`} /> -->
            <image href={image.url} width="{imageSize}" height="{imageSize}" x="{i * imageSize}" y="0" />
        {/each}
    </g>
</g>