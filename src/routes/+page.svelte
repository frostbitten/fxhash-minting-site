<script lang="ts">

    import { onMount, onDestroy } from 'svelte';
    import { writable } from 'svelte/store';
    
    import { walletStore, getTezosWalletService, handleDisconnect } from '$lib/services/wallet';
    import WalletConnect from '$lib/components/WalletConnect.svelte';
    import { browser } from '$app/environment';

    import { handleTezosMint } from '$lib/minter';

    import { getProjectData, getObjktBySlug } from '$lib/fxhashDataRetrieval';

    // import { processConfig } from '$lib/configProcessor';

	import components from '$lib/projectComponents';

	// const Hero = components.Hero;
	// const Home = components.Home;
    console.log('components', {components});
    

    // import Home from '$project/Home.svelte';
    import projectConfig from '$project/config';
    import { fullTick } from '$lib/svelteTools.js';







    const projectId = writable(projectConfig?.id);
    const previews = projectConfig.previews;

    console.log('projectConfig', {projectConfig});

    const objkts = writable([]);

    console.log('objkts', {$objkts});

    const mintPrice = writable({
        fee_currency: null,
        id: "0",
        mint_fee: null,
        opens_at: null,
        price: "0",
    });

    const mintCountdown = writable('');
    const mintCountdownStats = writable({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const mintedIteration = writable(null);
    // const mintedIteration = writable(8); //test
    const mintedObjkt = writable(null);

    const disconnectConfirmation = writable(false);

    const minting = writable(false);

    const mintingFinished = writable(false);

    // Handle connect button click
    async function handleConnect() {
        if (!browser) return;
        $walletStore.connecting = true;
        // $error = '';
        const service = await getTezosWalletService();
        console.log('tezos wallet service', {service});
        await service.connectWallet()
            .then((userAddress) => {
                console.log('user address', {userAddress});
                if (!userAddress) {
                    throw new Error('User rejected the connection');
                }
            })
            .catch((err) => {
                // $error = 'Failed to connect wallet: ' + err.message;
                console.error(err);
            })
            .finally(() => {
                $walletStore.connecting = false;
            })
    }

    const userCancelledWalletConnect = writable(false);
    const mintError = writable('');
    const checkMintedIteration = writable(false);

    const doMint = async ({reserve=null}) => {
        if($minting) return;
        if(!$projectId) {
            throw new Error('Project ID is not set');

        }
        if(!$generativeHash) {
            throw new Error('Generative hash is not set');
        }
        $userCancelledWalletConnect = false;
        $mintError = '';
        $minting = true;
        await fullTick();
        console.log('doMint called', {$minting});

        //first check if the user's wallet is connected
        if(!$walletStore.connected) {
            // wallet not connected, start the connection process
            await handleConnect();
        }

        if(!$walletStore.connected) {
            // still not connected, show an error or take appropriate action
            console.error('Wallet is not connected');
            $userCancelledWalletConnect = true;
            $minting = false;
            return;
        }

        const version = projectConfig.fxhashProject?.version;

        console.log('minting', {$projectId, $walletStore});
        try {
            const mintOp = await handleTezosMint($projectId, version, $mintPrice.price, {
                id: $mintPrice.id,
                reserve,
            });
            console.log('mintOp', {mintOp});
            $mintedIteration = getIterationIdFromOperation(mintOp);
            
            $checkMintedIteration = true;

        } catch (error) {
            console.error('Mint error:', error);
            if(error.errorType === 'ABORTED_ERROR') {
                $mintError = 'Minting aborted. Please try again.';
            } else if(error.errorType === 'INSUFFICIENT_BALANCE') {
                $mintError = 'Insufficient balance to mint.';
            } else {
                $mintError = 'Minting failed. Please try again.';
            }
        }

        await fullTick();
        $minting = false;
    }

    function objktsSort(a, b) {
        return a.iteration - b.iteration;
    }

    const generative_uri = writable(''); // https://onchfs.fxhash2.xyz/4b0c90084dde3b0019c0da5d5ea65b7dd38675a1fd20cf71b51ae2a1a5516a24/?cid=onchfs%3A%2F%2F4b0c90084dde3b0019c0da5d5ea65b7dd38675a1fd20cf71b51ae2a1a5516a24&fxhash=opFH64BsZ7HVmvjVaXNFag6LDyKWTiocbZkL7Sp8mGh62kgF6Gs&fxminter=tz1NoYMQaZa9Pz6Hwfx6B2x1TaGU3fSiBbW8&fxiteration=8&fxcontext=standalone&fxchain=TEZOS
    const generative_uri_scheme = writable(''); // onchfs
    const generativeHash = writable('');

    function updatePricing(){

        const pricingFixed = projectConfig.fxhashProject?.pricing_fixeds;
        if(pricingFixed && pricingFixed.length > 0) {
            const mintPriceData = pricingFixed[0];
            mintPrice.set(mintPriceData);
        }
    }

    onMount(async () => {


        const hash = window.location.hash;
        console.log('hash', {hash});

        if(hash && hash.startsWith('#slug:')) {
            const slug = hash.split('#slug:')[1];
            console.log('slug', {slug});
            const projectData = await getProjectData({slug:slug});
            console.log('projectData', {projectData});
            if(projectData) {
                // projectConfig.fxhashProject = projectData;
                // projectConfig.reprocess();
                $projectId = projectData.id;
                loadProjectData();
            }
        }

        // const objktTest = await getObjktBySlug({slug:`${projectConfig.fxhashProject?.slug}-${projectConfig.fxhashProject?.iterations_count}`});
        // console.log('objktTest getObjktBySlug', {objktTest});

        const _objkts = projectConfig.fxhashProject?.objkts;
        if(_objkts) {
            _objkts.sort(objktsSort);
            objkts.set(_objkts);

            console.log('objkts', {$objkts});
        }


        if(projectConfig.fxhashProject?.generative_uri){
            $generative_uri = projectConfig.fxhashProject.generative_uri;
            const generativeUriParts = $generative_uri.split('://');
            $generativeHash = generativeUriParts[1];
            $generative_uri_scheme = generativeUriParts[0];

        }

        console.log({projectConfig});

        updatePricing();

        let mintCounterInterval;
        if(!projectConfig.mintReady){
            mintCounterInterval = setInterval(() => {
                const currentCountDown = new Date(projectConfig.mintReadyDateTime).getTime() - new Date().getTime();
                const s	= 1000,
                    m	= s * 60,
                    h	= m * 60,
                    d	= h * 24;

                const days		= Math.floor(currentCountDown / d);
                const hours		= Math.floor((currentCountDown % d) / h);
                const minutes	= Math.floor((currentCountDown % h) / m);
                const seconds	= Math.floor((currentCountDown % m) / s);



                $mintCountdown = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

                $mintCountdownStats = {
                    days,
                    hours,
                    minutes,
                    seconds
                }
            }, 200);
        }
        
        refreshProjectData();

        const dataIntervalFast = setInterval(() => {
            if(projectConfig.mintReady) {
                refreshProjectData();
            }
        }, 10 * 1000);
        
        const dataIntervalSlow = setInterval(() => {
            if(!projectConfig.mintReady) {
                refreshProjectData();
            }
        }, 60 * 1000);

        const newMintInterval = setInterval(async () => {
            if($checkMintedIteration) {
                const found = await checkIterationData($mintedIteration);
                console.log('checkIterationData', {found});
                if(found) {
                    $mintedObjkt = found;
                    $checkMintedIteration = false;
                    if(Number(projectConfig.fxhashProject?.iterations_count) < Number($mintedIteration)) {
                        projectConfig.fxhashProject.iterations_count = $mintedIteration;
                    }
                    console.log('found minted objkt', {$mintedObjkt});
                }
            }
        }, 1000);


        async function checkIterationData(iteration){
            const iterationSlug = `${projectConfig.fxhashProject?.slug}-${iteration}`;
            const objkt = await getObjktBySlug({slug:iterationSlug});
            console.log('checkIterationData', {iteration,iterationSlug, objkt});
            if(!objkt) {
                console.log('objktInfo not found', {iterationSlug,iteration});
                return false;
            }
            console.log('objkt', {objkt});
            const existingObject = $objkts.find(o => String(o.iteration) === String(iteration));
            if(!existingObject) {
                objkt.dynamically_loaded = true;

                objkt.display_uri_https = `https://gateway.fxhash2.xyz/ipfs/` + objkt.display_uri.split('://')[1];

                if($generative_uri_scheme === 'onchfs') {
                    objkt.liveView_uri = `https://onchfs.fxhash2.xyz/${$generativeHash}/?cid=onchfs%3A%2F%2F${$generativeHash}&fxhash=${objkt.generation_hash}&fxminter=${objkt.minter.id}&fxiteration=${objkt.iteration}&fxcontext=standalone&fxchain=TEZOS`
                } else if($generative_uri_scheme === 'ipfs') {
                    objkt.liveView_uri = `https://gateway.fxhash2.xyz/ipfs/${$generativeHash}/?cid=${$generativeHash}&fxhash=${objkt.generation_hash}&fxminter=${objkt.minter.id}&fxiteration=${objkt.iteration}&fxcontext=standalone&fxchain=TEZOS`
                } else {
                    throw new Error('Unknown generative_uri_scheme: ' + $generative_uri_scheme);
                }
                $objkts.push(objkt);
                $objkts.sort(objktsSort);
                objkts.set($objkts);
            }
            return objkt;
        }


        return () => {
            clearInterval(dataIntervalFast);
            clearInterval(dataIntervalSlow);
            clearInterval(newMintInterval);
            clearInterval(mintCounterInterval);
        }
    });

    
        
    async function refreshProjectData(overwrite = false) {
        if(!$projectId) return;
        console.log('refreshProjectData called', {$projectId});
        const freshProjectData = await getProjectData({projectId:$projectId});

        if(overwrite || projectConfig?.demo) {
            projectConfig.fxhashProject = freshProjectData;
            projectConfig.reprocess();
            console.log('projectConfig updated', {projectConfig});
        }

        if(projectConfig.fxhashProject?.generative_uri){
            $generative_uri = projectConfig.fxhashProject.generative_uri;
            const generativeUriParts = $generative_uri.split('://');
            $generativeHash = generativeUriParts[1];
            $generative_uri_scheme = generativeUriParts[0];
        }

        console.log('freshProjectData', {freshProjectData});

        //merge various data
        ['iterations_count','pricing_fixeds'].forEach(key => {
            if(freshProjectData?.[key] !== undefined) {
                projectConfig.fxhashProject[key] = freshProjectData[key];
            }
        });

        updatePricing();
        
        //merge new objkts with existing ones
        const newObjkts = freshProjectData?.objkts || [];
        const _objkts = $objkts;
        for(let i = 0; i < newObjkts.length; i++) {
            const newObjkt = newObjkts[i];
            const existingObjktIndex = _objkts.findIndex(o => o.id === newObjkt.id);
            const isNew = existingObjktIndex === -1;
            const objkt = isNew ? newObjkt : _objkts[existingObjktIndex];

            if(isNew){
                objkt.dynamically_loaded = true;
                _objkts.push(objkt);
            }

            const lastDisplayUri = _objkts?.[existingObjktIndex]?.display_uri;
            objkt.display_uri = newObjkt.display_uri;
            objkt.display_uri_https = `https://gateway.fxhash2.xyz/ipfs/` + objkt.display_uri.split('://')[1];
            
            
            if($generative_uri_scheme === 'onchfs') {
                objkt.liveView_uri = `https://onchfs.fxhash2.xyz/${$generativeHash}/?cid=onchfs%3A%2F%2F${$generativeHash}&fxhash=${objkt.generation_hash}&fxminter=${objkt.minter.id}&fxiteration=${objkt.iteration}&fxcontext=standalone&fxchain=TEZOS`
            } else if($generative_uri_scheme === 'ipfs') {
                objkt.liveView_uri = `https://gateway.fxhash2.xyz/ipfs/${$generativeHash}/?cid=${$generativeHash}&fxhash=${objkt.generation_hash}&fxminter=${objkt.minter.id}&fxiteration=${objkt.iteration}&fxcontext=standalone&fxchain=TEZOS`
            } else {
                throw new Error('Unknown generative_uri_scheme: ' + $generative_uri_scheme);
            }


            if(lastDisplayUri !== objkt.display_uri) {
                objkt.dynamically_loaded = true;
                objkt.hidden = true;
                setTimeout(() => {
                    objkt.hidden = false;
                    $objkts = $objkts;
                }, 1000);
            }
        }
        _objkts.sort(objktsSort);

        //look for current $mintedIteration if applicable
        if($mintedIteration) {
            const mintedObjktIndex = _objkts.findIndex(o => Number(o.iteration) === Number($mintedIteration));
            $mintedObjkt = _objkts[mintedObjktIndex];
        }

        objkts.set(_objkts);

    }
        
    async function loadProjectData() {
        await refreshProjectData(true);
    }



    function getIterationIdFromOperation(mintOp) {
        const gentk_v3_operation = mintOp._operationResult._buffer[0][0].metadata.internal_operation_results.find((op)=>op.destination=="KT1EfsNuqwLAWDd3o4pvfUx1CAh5GMdTrRvr");
        let iterationId;
        for(let param of gentk_v3_operation.parameters.value) {
            for(let arg of param.args){
                if(arg?.args?.[0]?.int === String($projectId)) {
                    iterationId = arg.args[1].int;
                    break;
                }
            }
            if(iterationId) break;
        }
        return iterationId;
    }
    
</script>

<style>
    @reference 'tailwindcss';
</style>

<section id="hero" class="py-10 text-center">
    {#if projectConfig?.demo && !projectConfig?.fxhashProject?.id}
        <div class="demo">
            <input type="text" placeholder="Enter your project id" bind:value={$projectId} class="demo-input" name="project-id"/>
            <button on:click={loadProjectData} class="demo-button">Load</button>
        </div>
    {/if}
    {#if components.Hero}
        <svelte:component this={components.Hero} />
    {:else}
        {#if projectConfig.fxhashProject?.coverReady}
            <img src='media/cover' alt="Cover image" class="cover-image" />
        {:else if projectConfig.demo && projectConfig?.cover_display_uri_https}
            <img src={projectConfig?.cover_display_uri_https} alt="Cover image" class="cover-image" />
        {/if}
    {/if}
	<h1 class="project-title mb-4">{projectConfig.menuTitle || projectConfig.siteTitle || projectConfig.projectName || projectConfig.fxhashProject.name}</h1>
    
    {#if projectConfig.fxhashProject.slug}
        <div class="mt-2 text-sm">
            <a href={`https://www.fxhash.xyz/project/${projectConfig.fxhashProject.slug}`} target="_blank" rel="noopener noreferrer" class="">View on fxhash ↗</a>
        </div>
    {/if}


    {#if projectConfig.tagline}<p class="tagline">{projectConfig.tagline}</p>{/if}

    <div class="authors">
        <header> Created By </header>
        <ul>
            {#each projectConfig.authors as author}
                <li><a href="#authors">
                        {#if author.picture_ready}
                            <img src="{author.pictureUri}" alt="Author: {author.name || author.username}" class="" />
                        {:else if author.pictureUriHttps}
                            <img src="{author.pictureUriHttps}" alt="Author: {author.name || author.username}" class="" />
                        {:else}
                            <div class="img-placeholder icon-blank-avatar"></div>
                        {/if}
                        <span class="author-name">{author?.name || author.username}</span>
                    </a>
                </li>
            {/each}
        </ul>
    </div>


    <div class="mt-8">
        {#if projectConfig.mintReady}
            {#if projectConfig.mintClosed}
                <div class="mb-8"><h2>Minting is closed</h2></div>
                <a href="#explore" class="button">Explore</a>
                {#if projectConfig.fxhashProject?.iterations_count !== '0'}
                    <div class="mint-count"> <span class="number">{projectConfig.fxhashProject?.iterations_count}</span> minted total</div>
                {/if}
            {:else}
                <a href="#mint" class="button">Mint Now @ {$mintPrice.price / 1e6} ꜩ</a>
                {#if projectConfig.fxhashProject?.iterations_count !== '0'}
                    <div class="mint-count"> <span class="number">{projectConfig.fxhashProject?.iterations_count}</span> minted so far!</div>
                {/if}
            {/if}
        {:else}
            <a href="#mint" class="button">Mint soon!</a><br>
            {#if projectConfig?.showCounter !== false}
                <!-- <div class="mint-countdown">Minting starts in {$mintCountdown}</div> -->
                <div class="mint-countdown">
                    <header>Minting starts in</header>
                    <ul>
                        <li>{ $mintCountdownStats.days } days</li>
                        <li><span class="">{ $mintCountdownStats.hours }</span> hours</li>
                        <li><span class="">{ $mintCountdownStats.minutes }</span> minutes</li>
                        <li><span class="">{ $mintCountdownStats.seconds }</span> seconds</li>
                    </ul>
                </div>
            {/if}
        {/if}
    </div>

</section>

<section id="authors" class="py-16 border-t">
	<h2 class="text-2xl font-bold mb-6 text-center">About the artist{projectConfig.authors.length > 1 ? 's' : ''}</h2>
    <div class="authors-grid">
        {#each projectConfig.authors as author}
            <div class="author-card">
                <div class="author-picture">
                    {#if author.picture_ready}
                        <img src="{author.pictureUri}" alt="Author: {author.name}" class="" />
                    {:else if author.pictureUriHttps}
                        <img src="{author.pictureUriHttps}" alt="Author: {author.name}" class="" />
                    {:else}
                        <div class="img-placeholder icon-blank-avatar"></div>
                    {/if}
                </div>
                <div class="author-name">
                    {author?.name || author.username}
                </div>
                {#if author.website}
                    <div class="author-website">
                        <a href={author.website} target="_blank" rel="noopener noreferrer">{author.website}</a>
                    </div>
                {/if}
                <div class="author-objktcom">
                    <a href="https://objkt.com/profile/{author.id}" target="_blank" rel="noopener noreferrer">{author.id}</a>
                </div>
                {#if author.twitter}
                    <div class="author-twitter">
                        <a href={author.twitter} target="_blank" rel="noopener noreferrer">{author.twitter}</a>
                    </div>
                {/if}
                {#if author.instagram}
                    <div class="author-instagram">
                        <a href={author.instagram} target="_blank" rel="noopener noreferrer">{author.instagram}</a>
                    </div>
                {/if}
                {#if author.github}
                    <div class="author-github">
                        <a href={author.github} target="_blank" rel="noopener noreferrer">{author.github}</a>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</section>

<section id="details" class="py-16 border-t">
	<h2 class="text-2xl font-bold mb-6 text-center">About the collection</h2>
	<pre class="text-wrap">{ projectConfig.description || projectConfig.fxhashProject?.metadata?.description }</pre>
</section>

{#if previews.length > 0}
    <section id="gallery" class="py-16 border-t">
        <h2 class="text-2xl font-bold mb-6 text-center">Preview</h2>
        <div class="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {#each previews as preview, i}
                <!-- <div class="aspect-square bg-gray-200 rounded" aria-label={`Preview ${i + 1}`}></div> -->
                <img src={`previews/${preview}`} alt={`Preview ${i + 1}`} class="w-full h-full object-cover rounded" />
            {/each}
        </div>
    </section>
{/if}

{#if projectConfig.mintClosed}
    <section id="mint" class="py-16 border-t text-center">
        <h2 class="text-2xl font-bold mb-6">Minting is closed</h2>
        {#if projectConfig.fxhashProject?.iterations_count !== '0'}
            <div class="mint-count"> <span class="number">{projectConfig.fxhashProject?.iterations_count}</span> minted total</div>
        {/if}
    </section>
{/if}

{#if projectConfig.mintReady && !projectConfig.mintClosed}
<section id="mint" class="py-16 border-t text-center">
	<h2 class="text-2xl font-bold mb-6">Mint Yours</h2>

    {#if !$walletStore.connected}
        <div class="connect-wallet my-4">
            <button class="px-8 py-3 rounded" on:click={handleConnect}>Connect Wallet</button>
            {#if projectConfig.fxhashProject?.reserves.length > 0}
                <p>Connect your wallet to check your reserve</p>
            {:else}
                <p>Connect your wallet to mint</p>
            {/if}
        </div>
    {/if}

    <div class="mint-box mb-8">
        <p class="mb-4">Price: <strong>{$mintPrice.price / 1e6} ꜩ</strong></p>
        {#if !$minting}
            <div class="mint-buttons">
                
                <button class="px-8 py-3 rounded" on:click={doMint}>Mint now</button>


                {#each projectConfig.fxhashProject?.reserves as reserve}
                    {#if reserve?.data?.[$walletStore.userAddress]}
                        <div class="reserve-info">
                            <p>Reserved for you: <strong>{reserve.data[$walletStore.userAddress]}</strong></p>
                            <button class="px-8 py-3 rounded" on:click={() => doMint({reserve})}>Mint from Reserve</button>
                        </div>
                    {/if}
                {/each}

                <a href={`https://www.fxhash.xyz/project/${projectConfig.fxhashProject.slug}`} target="_blank" rel="noopener noreferrer" class="button px-8 py-3 rounded">
                    Mint with credit card (on fxhash) ↗
                </a>

            </div>

        {:else}
            <button class="px-8 py-3 rounded" disabled>Minting...</button>
        {/if}

        {#if $mintError}
            <div class="error mint-error">{$mintError}</div>
        {/if}
    </div>

    {#if $mintedIteration}
        <div class="success mint-success">
            {#if $mintedObjkt && $mintedObjkt.liveView_uri}
                <div>Minted successfully! Your iteration ID is: <strong>{$mintedIteration}</strong></div>
                <a href={`https://www.fxhash.xyz/iteration/${projectConfig.fxhashProject.slug}-${$mintedIteration}`} target="_blank" rel="noopener noreferrer">View your mint on fxhash ↗</a>
                <iframe src={$mintedObjkt.liveView_uri} class="live-mint" title="Live mint" allowfullscreen allow="accelerometer *; camera *; gyroscope *; microphone *; xr-spatial-tracking *" sandbox="allow-scripts allow-same-origin allow-modals"></iframe>
                
            {:else}
                <div class="mint-processing">
                    <h3>Mint successful!</h3>
                    <div>Your iteration ID is: <strong>{$mintedIteration}</strong></div>

                    <div>The blockchain and renderer is currently processing your final output.</div>
                    <div>Be just a moment...</div>
                </div>
            {/if}
        </div>
    {/if}

    <!-- {#if !$walletStore.connected}
        <div class="error wallet-error">Please connect your wallet to mint.</div>
    {/if} -->


    {#if $userCancelledWalletConnect}
        <div class="error wallet-error">Wallet connection cancelled. You'll need to connect your wallet to mint.</div>
    {/if}

    {#if $walletStore.connected}
        <div class="user-wallet-info">
            <h3 class="text-lg font-semibold">Wallet Connected</h3>
            <div><span class="address">{$walletStore.userAddress}</span></div>
            <div>Balance: {$walletStore.balance.toFixed(2)} ꜩ</div>
            {#if !$disconnectConfirmation}
                <div><button class="disconnect" on:click={() => $disconnectConfirmation = true}>Disconnect</button></div>
            {:else}
                <div>
                    <button class="disconnect" on:click={() => handleDisconnect() && ($disconnectConfirmation = false)}>Yes, Disconnect</button>
                    <button class="disconnect" on:click={() => $disconnectConfirmation = false}>Cancel</button>
                </div>
            {/if}
        </div>
    {/if}

</section>
{/if}

{#if projectConfig.mintReady}
<section id="explore" class="py-16 border-t">
	<h2 class="text-2xl font-bold mb-6 text-center">Recent mints</h2>
	<div class="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
		{#each $objkts as objkt, i}
			<div class="aspect-square rounded" aria-label={`Minted ${i + 1}`}>
                {#if !objkt?.hidden}
                    {#if objkt?.dynamically_loaded}
                        <img src={objkt?.display_uri_https} alt={`Minted ${objkt.iteration}`} class="w-full h-full object-contain rounded" loading="lazy" />
                    {:else}
                        <img src={'media/display_uri_' + objkt?.id} alt={`Minted ${objkt.iteration}`} class="w-full h-full object-contain rounded"  loading="lazy"/>
                    {/if}
                {:else}
                    <!-- hidden debug -->
                {/if}

                <div class="p-2">
                    <h3 class="text-lg font-semibold">{objkt?.name}</h3>
                    <p class="text-sm text-gray-500 break-all">Minted by {objkt?.minter?.name || objkt?.minter?.id}</p>
                    <p class="text-sm text-gray-500">Mint Price: {objkt?.minted_price / 1e6} ꜩ</p>
                    <p class="text-sm text-gray-500">Minted on {new Date(objkt?.created_at).toLocaleDateString()}</p>
                </div>
            </div>
		{/each}
	</div>
</section>
{/if}

<section id="faq" class="py-16 border-t text-center">
	<h2 class="text-2xl font-bold mb-6">FAQ</h2>
	<details class="mb-4">
		<summary class="cursor-pointer font-medium">How many pieces can I mint?</summary>
		<p class="mt-2">There is no limit to the number of pieces you can mint.</p>
	</details>
	<details class="mb-4">
		<summary class="cursor-pointer font-medium">When will metadata be revealed?</summary>
		<p class="mt-2">Immediately after mint.</p>
	</details>
</section>
