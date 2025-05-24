<script lang="ts">
	import '$lib/app.css';
	import '$lib/app.scss';
	import '$project/styles.css';
	import { writable } from 'svelte/store';
    import projectConfig from '$project/config';
    import { walletStore, getTezosWalletService, handleDisconnect } from '$lib/services/wallet';
    import WalletConnect from '$lib/components/WalletConnect.svelte';
	import { onMount } from 'svelte';
    import { on } from 'events';
	import { Buffer as BufferPolyfill } from 'buffer'
	declare var Buffer: typeof BufferPolyfill;
	globalThis.Buffer = BufferPolyfill
	
	let { children } = $props();
	


	const mobileOpen = writable(false);
	function toggleMobile() {
		$mobileOpen = !$mobileOpen;
	}
	function closeMobile() {
		$mobileOpen = false;
	}

	// console.log({projectConfig});


	const AdminPanel = writable(null);
	const AdminPanelOpen = writable(false);
	function openAdminPanel() {
		$AdminPanelOpen = true;
	}
	function closeAdminPanel() {
		$AdminPanelOpen = false;
	}
	function toggleAdminPanel() {
		$AdminPanelOpen = !$AdminPanelOpen;
	}

	onMount(async () => {
		console.log('layout mounted');
		// console.log({dev: import.meta.env.DEV});
        if (import.meta.env.DEV) {
            const mod = await import('$lib/admin/AdminPanel.svelte');
			$AdminPanel = mod.default;
			// console.log('Admin component loaded', {Admin});
        }
		getTezosWalletService();
	})

</script>

<header class="shadow">
	<nav class="">
		<div class="container mx-auto flex items-center justify-between p-4">
			<a href="/" class="text-xl font-bold">{projectConfig.menuTitle || projectConfig.siteTitle || projectConfig.projectName}</a>
			<ul class="hidden md:flex gap-6">
				<!-- {#if projectConfig.mintReady}
					<li><a href="#mint">Mint now</a></li>
				{:else}
					<li><a href="#mint" class="">Mint soon!</a></li>
				{/if}
				{#if projectConfig.mintReady}
					<li><a href="#explore">Explore mints</a></li>
				{/if} -->
				{#if $AdminPanel}
					<li><a href="#admin" onclick={openAdminPanel}>Admin</a></li>
				{/if}
			</ul>
			<button class="md:hidden" aria-label="Toggle navigation" onclick={toggleMobile}>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d={$mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
				</svg>
			</button>
		</div>
	</nav>
	{#if $mobileOpen}
		<nav class="md:hidden border-t">
			<ul class="flex flex-col gap-4 p-4">
				<!-- <li><a href="#mint" class="block" onclick={() => $mobileOpen = false}>Mint now</a></li>
				<li><a href="#explore" class="block" onclick={() => $mobileOpen = false}>Explore mints</a></li>
				{#if !$walletStore.connected}
					<li><a href="#connect" class="block" onclick={() => $mobileOpen = false}>Connect wallet</a></li>
				{/if} -->
				{#if $AdminPanel}
					<li><a href="#admin" onclick={()=> {openAdminPanel(); closeMobile()} }>Admin</a></li>
				{/if}
			</ul>
		</nav>
	{/if}
</header>

{#if $AdminPanel && $AdminPanelOpen}<svelte:component this={$AdminPanel} close={closeAdminPanel} />{/if}

<main class="container mx-auto p-4">
	{@render children()}
</main>

<!-- <div class="modal">
    {#if !$walletStore.connected}
        <div id="connect">
            <div class="py-2 text-center">
                <p>Connect your Tezos wallet to mint from the fxhash smart contract.</p>
                <div class="wallet-connect mt-4">
                    <WalletConnect />
                </div>
            </div>
        </div>
    {:else}
        <div>
            <div class="">
                <div class="wallet-info">
                    <p>Connected: <span class="address">{$walletStore.userAddress}</span></p>
                    <p>Balance: {$walletStore.balance.toFixed(2)} ꜩ</p>
                    <button type="button" onclick={handleDisconnect} class="disconnect-btn">Disconnect</button>
                </div>
            </div>
        </div>
    {/if}
</div> -->

<footer class="mt-6">
	<div class="container mx-auto p-6 text-center text-sm">
		© {new Date().getFullYear()} {projectConfig.copyright || projectConfig.siteTitle || projectConfig.projectName || projectConfig.fxhashProject.name} – All rights reserved
	</div>
</footer>
