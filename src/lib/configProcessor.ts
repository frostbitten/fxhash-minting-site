//configProcessor.ts


import allFiles from '../../project/allFiles.json';


const ipfsBase = 'https://gateway.fxhash2.xyz/ipfs/';

import previews from '../../project/previews.json';

export function processConfig(config) {


    config.previews = previews;

    // console.log('allFiles', allFiles);
    //merge authors

    const authors = config.authors || [];

    preProcessAuthors(config.fxhashProject);

    const fxhashProjectAuthors = config.fxhashProject?.authors || [];
    // console.log('fxhashProjectAuthors', fxhashProjectAuthors);
    fxhashProjectAuthors.forEach((author) => {
        const authorExists = authors.find((a) => a.id === author.id);
        if (!authorExists) {
            authors.push(author);
        }else{
            Object.keys(author).forEach((key) => {
                authorExists[key] = author[key];
            });
        }
    });

    authors.forEach((author) => {
        if (author.picture) {
            let mediaLocation;
            if (author.picture.startsWith('ipfs://')) {
                mediaLocation = `media/author-${author.id}`;
                author.pictureUriHttps = ipfsBase + author.picture.split('://')[1];
            }else{
                mediaLocation = `media/${author.picture}`;
            }
            const mediaExists = allFiles.find((file) => file === mediaLocation);
            if(mediaExists){
                author.picture_ready = true;
            }else{
                author.picture_ready = false;
            }
            author.pictureUri = mediaLocation;
        }
    });
    config.authors = authors;


    if (config.fxhashProject?.display_uri) {
        config.cover_display_uri_https = ipfsBase + config.fxhashProject?.display_uri.split('://')[1];
    }

    if(config.fxhashProject?.mint_opens_at){
        config.mintReadyDateTime = new Date(config.fxhashProject?.mint_opens_at).getTime(); 
    }
    
    config.mintReady = Date.now() > config.mintReadyDateTime;

    config.reprocess = () => {
        processConfig(config);
        console.log('config reprocessed', {config});
    };

    return config;
}

function preProcessAuthors(data) {
    const authors = [];
    function processAuthor(authorData) {
        return {
            id: authorData?.id,
            username: authorData?.wallet_account?.account?.username,
            picture: authorData?.wallet_account?.account?.profile?.picture,
            twitter: authorData?.wallet_account?.account?.profile?.twitter,
            website: authorData?.wallet_account?.account?.profile?.website,
            instagram: authorData?.wallet_account?.account?.profile?.instagram,
        }
    }

    if(data?.author?.collaborations?.length){
        data?.author?.collaborations.forEach((collab) => {
            authors.push(processAuthor(collab.collaborator));
        });
    } else if(data?.user) {
        authors.push(processAuthor(data?.user));
    }
    data.authors = authors;
}