// src/lib/services/wallet.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Store to keep track of wallet connection state
export const walletStore = writable({
	connected: false,
	userAddress: '',
	balance: 0,
	connecting: false,
});

// We'll create a lazy-loaded service that only initializes in the browser
let tezosService: TezosWalletService | null = null;

export const getTezosWalletService = async () => {
	if (browser && !tezosService) {
		try {
			// Dynamically import Taquito libs only on the client side
			const { TezosToolkit } = await import('@taquito/taquito');
			const { BeaconWallet } = await import('@taquito/beacon-wallet');

			tezosService = new TezosWalletService(TezosToolkit, BeaconWallet);	// ← NetworkType no longer passed
			await tezosService.checkConnection();
		} catch (error) {
			console.error('Error initializing Tezos wallet service:', error);
		}
	}
	return tezosService;
};

// Handle disconnect button click
export async function handleDisconnect() {
	if (!browser) return;
	try {
		const service = await getTezosWalletService();
		if (service) await service.disconnectWallet();
	} catch (err) {
		console.error(err);
	}
}

// Service class
class TezosWalletService {
	private tezos: any;
	private wallet: any;
	private network: string;

	constructor(TezosToolkit: any, BeaconWallet: any) {
		const RPC_URL = 'https://mainnet.smartpy.io';
		this.network = 'mainnet';								// ← simple string
		this.tezos = new TezosToolkit(RPC_URL);

		this.wallet = new BeaconWallet({
			name: 'fxhash Minting Site',
			network: { type: this.network },					// ← new option
		});

		this.tezos.setWalletProvider(this.wallet);
		this.checkConnection();
	}

	// Check if we already have an active connection
	async checkConnection() {
		try {
			const activeAccount = await this.wallet.client.getActiveAccount();
			if (activeAccount) {
				const userAddress = await this.wallet.getPKH();
				const balance = await this.tezos.tz.getBalance(userAddress);
				walletStore.set({
					connected: true,
					userAddress,
					balance: balance.toNumber() / 1_000_000,
				});
			}
		} catch (error) {
			console.error('Error checking connection:', error);
		}
	}

	// Connect wallet
	async connectWallet() {
		return new Promise(async (resolve, reject) => {
			if (browser) {
				const { BeaconEvent } = await import('@airgap/beacon-dapp');
				try {
					console.log('connectWallet');
					// const activeAccount = await this.wallet.requestPermissions({
					// await this.wallet.requestPermissions({
					// 	network: { type: this.network },
					// });
					let account = null;
					
					this.wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async (_account) => {
						// An active account has been set, update the dApp UI
						console.log(`${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `, _account);
						// resolve(account);
						if(_account){
							
							const userAddress = _account.address;
							const balance = await this.tezos.tz.getBalance(userAddress);
							
							walletStore.set({
								connected: true,
								userAddress,
								balance: balance.toNumber() / 1_000_000,
							});
						}
						account = _account;
					});

					const testStatus = setInterval(() => {
						if(account===null) return;
						console.log('account set', account);
						clearInterval(testStatus);
						resolve(account?.address);
					}, 200);

					await this.wallet.client.requestPermissions();

					// const userAddress = await this.wallet.getPKH();
					// const balance = await this.tezos.tz.getBalance(userAddress);

					// walletStore.set({
					// 	connected: true,
					// 	userAddress,
					// 	balance: balance.toNumber() / 1_000_000,
					// });

					// return userAddress;
					// resolve(userAddress);
				} catch (error) {
					console.error('Error connecting wallet:', error);
					reject(false)
				}
			}else
			reject(new Error('Not in browser environment'));
		});
	}

	// Disconnect wallet
	async disconnectWallet() {
		try {
			await this.wallet.client.clearActiveAccount();
			walletStore.set({ connected: false, userAddress: '', balance: 0 });
		} catch (error) {
			console.error('Error disconnecting wallet:', error);
			throw error;
		}
	}

	getWallet() {
		return this.wallet;
	}
	getTezos() {
		return this.tezos;
	}
}
