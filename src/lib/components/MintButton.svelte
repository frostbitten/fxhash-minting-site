<script>
    import { onMount } from 'svelte';
    import { walletStore, getTezosWalletService } from '$lib/services/wallet';

    
    
    // Transaction status states
    let status = 'ready'; // 'ready', 'pending', 'success', 'error'
    let txHash = '';
    let errorMessage = '';
    
    // FxHash contract and project details
    const fxhashContractAddress = "KT1BJC12dG17CVvPKJ1VYaNnaT5mzfnUTwXv";
    export const projectId = 25854; // This should be configurable
    
    // Function to handle the minting process
    async function handleMint() {
      if (status === 'pending') return;
      
      try {
        // Set status to pending
        status = 'pending';
        errorMessage = '';
        
        // Check if wallet is connected
        if (!$walletStore.connected) {
          status = 'error';
          errorMessage = 'Wallet not connected. Please connect your wallet first.';
          return;
        }
        
        // Get Tezos instance from your wallet service
        // Assuming your wallet service exposes the Tezos instance or provides a way to get it
        const walletService = (await getTezosWalletService());

        const Tezos = walletService.tezos;
        
        // Load the contract
        const contract = await Tezos.wallet.at(fxhashContractAddress);

        console.log('do mint',{walletService, Tezos, contract});
        
        // Call the mint entrypoint with the project ID
        // The exact parameter structure depends on the contract implementation
        const op = await contract.methods.mint(
            projectId, // Make sure this is actually a number, not a string
            null,      // First optional parameter (None in Michelson)
            null       // Second optional parameter (None in Michelson)
        ).send({ amount: 1 }); // 1 tez
        
        txHash = op.opHash;
        console.log(`Waiting for ${op.opHash} to be confirmed...`);
        
        // Wait for confirmation (2 blocks)
        await op.confirmation(2);
        
        // Set status to success
        status = 'success';
        
      } catch (error) {
        status = 'error';
        errorMessage = error.message || 'An error occurred during minting';
        console.error('Mint error:', error);
      }
    }
    
    // Reset error state when wallet connection changes
    $: if ($walletStore.connected && status === 'error' && errorMessage === 'Wallet not connected. Please connect your wallet first.') {
      status = 'ready';
      errorMessage = '';
    }
  </script>
  
  <div class="mint-container">
    <button 
      class="mint-button" 
      on:click={handleMint} 
      disabled={status === 'pending' || !$walletStore.connected}
    >
      {#if !$walletStore.connected}
        Connect Wallet First
      {:else if status === 'pending'}
        Minting...
      {:else if status === 'success'}
        Mint Successful!
      {:else if status === 'error'}
        Mint Failed - Try Again
      {:else}
        Mint Now
      {/if}
    </button>
    
    {#if status === 'pending'}
      <div class="status-message pending">
        Transaction in progress...
      </div>
    {/if}
    
    {#if status === 'success'}
      <div class="status-message success">
        Mint successful! Transaction hash: 
        <a href={`https://tzkt.io/${txHash}`} target="_blank" rel="noopener noreferrer">
          {txHash.substring(0, 10)}...
        </a>
      </div>
    {/if}
    
    {#if status === 'error'}
      <div class="status-message error">
        Error: {errorMessage}
      </div>
    {/if}
  </div>
  
  <style>
    .mint-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin: 2rem 0;
    }
    
    .mint-button {
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .mint-button:hover:not(:disabled) {
      background-color: #2980b9;
    }
    
    .mint-button:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    
    .status-message {
      padding: 10px;
      border-radius: 4px;
      text-align: center;
      max-width: 400px;
    }
    
    .pending {
      background-color: #f39c12;
      color: white;
    }
    
    .success {
      background-color: #2ecc71;
      color: white;
    }
    
    .error {
      background-color: #e74c3c;
      color: white;
    }
  </style>