//ipfs data retrieval

const ipfsSources = [
    'https://gateway.fxhash2.xyz/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
];

import fsSync from 'fs';
import path from 'path';

export const getIpfsData = async (ipfsHash, type = "buffer", useCache=true) => {

    if(ipfsHash.toLowerCase().startsWith('ipfs://')) {
        ipfsHash = ipfsHash.slice('ipfs://'. length);
    }

    if(useCache) {
        //check if we already have the file
        const filePath = path.join(process.cwd(), 'ipfs-cache', ipfsHash);
        if (fsSync.existsSync(filePath)) {
            const fileBuffer = fsSync.readFileSync(filePath);
            return Buffer.from(fileBuffer);
        }
    }


    for (const source of ipfsSources) {
        const url = `${source}${ipfsHash}`;
        try {
            const response = await fetch(url);
            if (response.ok) { // return raw data from response because it could be an image or text or anything else

                const buffer = await response.arrayBuffer();
                const fileBuffer = Buffer.from(buffer);
                if(useCache) {
                    //store the file in the cache
                    const filePath = path.join(process.cwd(), 'ipfs-cache', ipfsHash);
                    if (!fsSync.existsSync(filePath)) {
                        fsSync.mkdirSync(path.dirname(filePath), { recursive: true });
                        fsSync.writeFileSync(filePath, fileBuffer);
                    }
                }
                
                return fileBuffer;

                if (type === "json") {
                    return response.json();
                }
                else if (type === "blob") {
                    return response.blob();
                } else if (type === "text") {
                    return response.text();
                }
                return fileBuffer;
                
            }
        } catch (error) {
            console.error(`Error fetching data from ${source}: ${error}`);
        }
    }
    return null;
};