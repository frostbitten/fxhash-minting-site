

import fxhashProject from './fxhash-project.json';
import { processConfig } from '../src/lib/configProcessor';


const mintReadyDateTime = new Date(
    fxhashProject?.mint_opens_at || 
    '3000-01-01T00:00:00Z' // if your project isn't published yet but your know the launch date/time, you can set it here.
).getTime(); 

const projectConfig = {
    mintReadyDateTime: mintReadyDateTime,
    fxhashProject, //don't touch this. This contains the dynamically loaded fxhash project data.


    /* 
        PROEJCT ID.
        This is the most important part of the config.
        It needs to be wrapped in quotes so it is treated like text.
        This can be any tezos or eth project id.
        If your project is not yet on fxhash, keep the line commented out (keep the // at the start of the line)
        and instead provide the project details manually below.
    */
    // id: '999999', 


    projectName: 'My Project', // comment out to use the fxhash project name
    description: `
This is a sample project description. It can be a long text that describes the project, its purpose, and any other relevant information.

Use multiple lines to format the text as needed.
    `,
    
    authors : [ //you can manually define authors here. This is helpful if your project is not yet on fxhash.
        {
            name: 'Hardcoded Author',
            id: "tz1111111111111111111111111111111111",
        },
    ],

    // tagline: 'A sample project configuration file.',
    tagline: fxhashProject?.metadata?.description?.split('.')?.[0] || 'A sample project', // use the first sentence of the fxhash project description as the tagline



    // showCounter: false, // uncomment this line to hide the project launch countdown if you wish.
    
}

export default processConfig(projectConfig);