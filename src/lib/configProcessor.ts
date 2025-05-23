//configProcessor.ts


import allFiles from '../../project/allFiles.json';


import previews from '../../project/previews.json';

export function processConfig(config) {


    config.previews = previews;

    // console.log('allFiles', allFiles);
    //merge authors

    const authors = config.authors || [];
    const fxhashProjectAuthors = config.fxhashProject?.authors || [];
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


    
    config.mintReady = Date.now() > config.mintReadyDateTime;


    return config;
}