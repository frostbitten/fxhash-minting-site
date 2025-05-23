import { tick } from 'svelte';

export const fullTick = ( timeout = 0) => new Promise(async(resolve, reject) => {
    await tick();
    setTimeout(() => {
        resolve(true)
    }, timeout);
}); 