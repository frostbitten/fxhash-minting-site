
import { walletStore, getTezosWalletService } from '$lib/services/wallet';
import { writable, get } from 'svelte/store';
const fxhashContractAddresses = {
    "V2": "KT1BJC12dG17CVvPKJ1VYaNnaT5mzfnUTwXv",
    "V3": "KT1Xpmp15KfqoePNW9HczFmqaGNHwadV2a3b",
};

let status = 'ready'; // 'ready', 'pending', 'success', 'error'

// Function to handle the minting process
export async function handleTezosMint(projectId, version, amount, data = {}) {
    if (status === 'pending') return;
    
    const fxhashContractAddress = fxhashContractAddresses[version];
    const projectIdNum = Number(projectId);

    if (!fxhashContractAddress) {
        console.error('Invalid contract version:', version);
        return;
    }
    try {

        const $walletStore = get(walletStore);
        // Set status to pending
        status = 'pending';
        // errorMessage = '';
        
        // Check if wallet is connected
        if (!$walletStore.connected) {
            status = 'error';
            // errorMessage = 'Wallet not connected. Please connect your wallet first.';
            return;
        }
        
        // Get Tezos instance from your wallet service
        const walletService = (await getTezosWalletService());

        const Tezos = walletService.tezos;
        // Load the contract
        const contract = await Tezos.wallet.at(fxhashContractAddress);
        
        let op;
        if( version === 'V2' ) {

            console.log('doing mint',{walletService, Tezos, contract, projectId, projectIdNum, amount});

            
            // Call the mint entrypoint with the project ID
            // The exact parameter structure depends on the contract implementation
            op = await contract.methods.mint(
                projectIdNum, // Make sure this is actually a number, not a string
                null,      // First optional parameter (None in Michelson)
                null       // Second optional parameter (None in Michelson)
            ).send({ amount, mutez: true });
        
        }else if( version === 'V3' ) {
            // await mintTokenV3({
            //     tezos: Tezos,
            //     contractAddress: fxhashContractAddress,
            //     createTicket: null,
            //     inputBytes: '',
            //     issuerId: projectIdNum,
            //     recipient: null,
            //     referrer: null,
            //     reserveInput: null,
            //     amount: amount,
            // });
            const createTicket = data.create_ticket || null;
            const inputBytes = data.input_bytes || '';
            const issuerId = projectIdNum;
            const recipient = data.recipient || null;
            const referrer = data.referrer || null;
            const reserveInput = data.reserve_input || null;
                
            op = await contract.methodsObject.mint({
                create_ticket: createTicket ? { bytes: createTicket.replace(/^0x/, '') } : null,
                input_bytes: inputBytes.replace(/^0x/, ''),
                issuer_id: issuerId,
                recipient: recipient ? recipient : null,
                referrer: referrer ? referrer : null,
                reserve_input: reserveInput ? reserveInput.replace(/^0x/, '') : null
            }).send({ amount, mutez: true });
        }

        console.log('Minting operation:', {op});

        // const txHash = op.opHash;
        console.log(`Waiting for ${op.opHash} to be confirmed...`);
        
        // Wait for confirmation (2 blocks)
        await op.confirmation(2);
        
        // Set status to success
        status = 'success';

        return op;
        
    } catch (error) {
        status = 'error';
        // errorMessage = error.message || 'An error occurred during minting';
        console.error('Mint error:', error);
        // if(error?.errorType === 'ABORTED_ERROR'){
            // console.error('CONTRACT_ERROR:', error);
        // }
        throw error;
    }
}