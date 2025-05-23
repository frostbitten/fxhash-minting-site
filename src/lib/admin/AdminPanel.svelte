<script lang="ts">
    import projectConfig from '$project/config';
    import { writable } from 'svelte/store';

    import { getProjectData } from '$lib/fxhashDataRetrieval';

    import { fullTick } from '$lib/svelteTools';

    export let close = () => {};

    const fxhashProjectId = writable(projectConfig.fxhashProject.id);
    const loadingProjectData = writable(false);

    async function loadProjectData() {
        const projectId = $fxhashProjectId;
        if (!projectId) {
            alert('Please enter a project ID');
            return;
        }
        $loadingProjectData = true;
        await fullTick();
        
        const response = await fetch(`/__admin/updateProject/${projectId}`);
        if (!response.ok) {
            // alert('Failed to load project data');
            console.log('failed to load project data', { response });
            return;
        }
        const projectData = await response.json();
        console.log('loaded project data', { projectData });
        $loadingProjectData = false;
    }

</script>

<style>
    /* @import "tailwindcss"; */
    /* @reference $lib/app.css; */
    @reference '../app.css';
    /* @reference 'tailwindcss'; */
    /* @reference 'tailwindcss/utils'; */
    .admin-panel {
        @apply fixed bg-black text-white flex flex-col items-center justify-center z-50 p-6 rounded-lg shadow-lg 
            top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            text-left;
        width: 22em;
        max-width: calc(100vw - 4em);
    }
    .close-btn {
        @apply absolute top-4 right-4 bg-blue-500 text-white rounded text-sm p-1;
    }

    label {
        @apply flex flex-row gap-2 items-center mb-4;
        > span {
            white-space: nowrap;
        }
    }
</style>

<div class="admin-panel">

    <button on:click={close} class="close-btn">❌</button>
    <header class="flex justify-between items-center w-full mb-4 align-middle">
        <h1 class="text-2xl font-bold">Admin Panel</h1>
    </header>

    <section class="mb-4">
        <label for="project-id">
            <span>Project id</span>
            <input type="text" bind:value={$fxhashProjectId} class="border p-2 rounded w-full" placeholder="Project ID" id="project-id" />
        </label>
        {#if !$loadingProjectData}
            <button class="loading-btn" disabled={$loadingProjectData} on:click={loadProjectData}>Load Project Data</button>
        {:else}
            <p class="text-sm text-gray-500">Loading project data...</p>
        {/if}


    </section>


</div>