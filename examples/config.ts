

import fxhashProject from './fxhash-project.json';
import { processConfig } from '../src/lib/configProcessor';


const mintReadyDateTime = new Date(fxhashProject?.mint_opens_at || '3000-01-01T00:00:00Z').getTime();

const projectConfig = {
    fxhashProject,

    // id: '0xF0D4c15A57ee8D7b16345c2A799df3473B6e54C7', // CLOSED. NO POST MINT EXPLORE. marcelo's "Um código simples para vidas complexas" (OPEN EDITIONS UNTIL May 9, 2025 @ 20:33)
    // id: '0x283aA8F76496Aee03693e2e7952f0Ad62e6Ed8aE', // OPEN. ETH. 32 EDITIONS. "GuilVille: City Skyscrapers (ETH Enhanced)""
    // id: '31724', // OPEN. OPEN EDITION. "Fifty Frames of Wave"


    projectName: 'My Project',
    description: `
This is a sample project description. It can be a long text that describes the project, its purpose, and any other relevant information.

Use multiple lines to format the text as needed.
    `,
    
    authors : [
        {
            name: 'Matthew Seremet',
            id: "tz1NoYMQaZa9Pz6Hwfx6B2x1TaGU3fSiBbW8",
        },
        {
            name: 'Hardcoded Author',
            // id: "tz1111111111111111111111111111111111",
        },
    ],

    // tagline: 'A sample project configuration file.',
    tagline: fxhashProject?.metadata?.description?.split('.')?.[0] || 'A sample project',


    mintReadyDateTime: mintReadyDateTime,
    showCounter: false,
    
}

export default processConfig(projectConfig);