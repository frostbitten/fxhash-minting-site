<script lang="ts">
    import WalletConnect from '$lib/components/WalletConnect.svelte';

    // import { imageStore } from '$lib/stores/imageStore';

    import { onMount } from 'svelte';
    
    // import ImageMarquee from '$lib/components/ImageMarquee.svelte';
    import ImageMarqueeSVG from '$lib/components/ImageMarqueeSVG.svelte';
    
    // imageStore.refresh();

    export let images = [];

    onMount(() => {
        // imageStore.refresh();
        console.log('mounted',{images});
    });
  
</script>

<svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" id="svg-bg">
    <g transform="translate(0,0)" data-images={images.length}>
        <ImageMarqueeSVG images={images} animationDuration={20} id="marquee" />
        <!-- <use href="#marquee" transform-origin="250 0" transform="translate(0,100) scale(-1,1)" />
        <use href="#marquee" transform-origin="250 0" transform="translate(0,200) scale(1,1)" />
        <use href="#marquee" transform-origin="250 0" transform="translate(0,300) scale(-1,1)" />
        <use href="#marquee" transform-origin="250 0" transform="translate(0,400) scale(1,1)" /> -->
    </g>
</svg>
