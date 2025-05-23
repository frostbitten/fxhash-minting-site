

import fxhashProject from './fxhash-project.json';
import { processConfig } from '../src/lib/configProcessor';


// const mintReadyDateTime = new Date(fxhashProject?.mint_opens_at || '3000-01-01T00:00:00Z').getTime();
const mintReadyDateTime = new Date(fxhashProject?.mint_opens_at || '2025-06-01T00:00:00Z').getTime();

const projectConfig = {
    fxhashProject,

    // id: '0xF0D4c15A57ee8D7b16345c2A799df3473B6e54C7', // CLOSED. NO POST MINT EXPLORE. marcelo's "Um código simples para vidas complexas" (OPEN EDITIONS UNTIL May 9, 2025 @ 20:33)
    // id: '0x283aA8F76496Aee03693e2e7952f0Ad62e6Ed8aE', // OPEN. ETH. 32 EDITIONS. "GuilVille: City Skyscrapers (ETH Enhanced)""
    // id: '31724', // OPEN. OPEN EDITION. "Fifty Frames of Wave"


    projectName: 'CemGen.svg.gif',
    description: `
The first ever infinitely scalable series of animated loops, created by Cem Hasimi and Matthew Seremet.

Exportable as both GIF and SVG. The SVG version is infinitely scalable, forever future-proof, it can be displayed at any size without losing quality.
    `,
    
    authors : [
        {
            name: 'Cem Hasimi',
            // id: "tz1111111111111111111111111111111111",
            id: "tz1YdVkQjRzX5J6R3bWbf7byByxhKwWLTPwD",
            picture: 'cem-avatar.jpg',
            twitter: 'https://twitter.com/cemhah',
        },
        {
            name: 'Matthew Seremet',
            id: "tz1NoYMQaZa9Pz6Hwfx6B2x1TaGU3fSiBbW8",
            picture: 'matt-avatar.webp',
            twitter: 'https://twitter.com/frostbitten',
        },
    ],

    tagline: 'Generative perfect loops, exportable as SVG and GIF',
    // tagline: fxhashProject?.metadata?.description?.split('.')?.[0] || 'A sample project',


    mintReadyDateTime: mintReadyDateTime,
    // showCounter: false,

    copyright: `Cem Hasimi and Matthew Seremet. All rights reserved.`
    
}

export default processConfig(projectConfig);