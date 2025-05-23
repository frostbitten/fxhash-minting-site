<!-- src/lib/components/WalletConnect.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { walletStore, getTezosWalletService, handleDisconnect } from '$lib/services/wallet';
  import { Buffer } from 'buffer';
  import { writable } from 'svelte/store';

  
  const connecting = writable(false);
  const error = writable('');
  const mounted = writable(false);
  
  // Handle connect button click
  async function handleConnect() {
    if (!browser) return;
      $connecting = true;
      $error = '';
      const service = await getTezosWalletService();
      console.log('tezos wallet service', {service});
      service.connectWallet()
        .then((userAddress) => {
          console.log('user address', {userAddress});
          if (!userAddress) {
            throw new Error('User rejected the connection');
          }
        })
        .catch((err) => {
          $error = 'Failed to connect wallet: ' + err.message;
          console.error(err);
        })
        .finally(() => {
          $connecting = false;
        })
  }
  
  
  // Initialize wallet connection check on component mount
  onMount(async () => {
    
    // @ts-ignore
    window.Buffer = Buffer;
    // The service initialization will check for existing connection
    await getTezosWalletService();
    $mounted = true;
  });
</script>
<style>
  @reference 'tailwindcss';

  .wallet-connect {
  }
  
  .address {
    font-family: monospace;
    font-size: 0.875rem;
    word-break: break-all;
  }
  
  .connect-btn {
  }
  
  .disconnect-btn {
  }
  
  .error {
    color: #dc3545;
    margin-top: 0.5rem;
  }
</style>

{#if $mounted}
<!-- <pre>
  {JSON.stringify($walletStore, null, 2)}
</pre> -->
  <div class="wallet-connect">
    {#if $walletStore.connected}
      <div class="wallet-info">
        <p>Connected: <span class="address">{$walletStore.userAddress}</span></p>
        <!-- <p>Balance: {$walletStore.balance.toFixed(2)} ꜩ</p> -->
        <button onclick={handleDisconnect} class="disconnect-btn">Disconnect</button>
      </div>
    {:else}
      <button 
        onclick={() => handleConnect()} 
        disabled={$connecting} 
        class="connect-btn"
      >
        {$connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {#if $error}
        <p class="error">{$error}</p>
      {/if}
    {/if}
  </div>
{:else}
  <div class="wallet-connect">
    <button disabled class="connect-btn">Loading wallet...</button>
  </div>
{/if}