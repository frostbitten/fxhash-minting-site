import { json } from '@sveltejs/kit';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

import { getProjectData } from '$lib/admin/fxhashDataRetrieval';

import { getIpfsData } from '$lib/admin/ipfs';

import { rmrf } from '$lib/admin/fsgood';

import { processProjectFiles } from '../../../../scripts/processProjectFiles';

import projectConfig from '$project/config';
const projectId = projectConfig.fxhashProject?.id || 0;

let lastProjectId = projectId;

export const prerender = false;				// never in static build

function buildQuery(action: string, arg: string) {
	switch (action) {
		case 'updateProject':
			return {
				file: 'fxhash-project.json',
				query: getProjectData,
				vars: { projectId: String(arg) },
                postRetrieval: async (data) => {


                    console.log('compare project id', { lastProjectId, id: data.id });

                    //check if we changed the project id
                    if (String(lastProjectId) !== String(data.id)) {
                        console.log('project id changed', { lastProjectId, id: data.id });
                        lastProjectId = data.id;
                        //erase all the project media
                        for (const dir of ['static']) {
                            const mediaPath = path.join(process.cwd(), dir, 'media');
                            if (fsSync.existsSync(mediaPath)) {
                                await rmrf(mediaPath);
                                console.log('remove media dir', mediaPath);
                            }
                        }
                    };
                    ;['project', 'static'].forEach(async (dir) => {
                        const mediaPath = path.join(process.cwd(), dir, 'media');
                        await fs.mkdir(mediaPath, { recursive: true });
                        console.log('create media dir', mediaPath);
                    });



                    //download and store the project cover image (display_uri)
                    const display_uri = data?.display_uri;
                    if (display_uri) {
                        const coverImage = await getIpfsData(display_uri);
                        if (coverImage) {
                            // await fs.writeFile(
                            //     path.join(process.cwd(), 'project', 'media', 'cover'),
                            //     coverImage
                            // );
                            await fs.writeFile(
                                path.join(process.cwd(), 'static', 'media', 'cover'),
                                coverImage
                            );
                            data.coverReady = true;
                        }
                    }

                    //download and store the outputs
                    const outputs = data?.objkts;
                    for (const output of outputs) {
                        ['display_uri', 'thumbnail_uri'].forEach(async (uri) => {
                            const outputUri = output[uri];
                            if (outputUri) {
                                const outputName = `${uri}_${output.id}`;
                                if (!fsSync.existsSync(path.join(process.cwd(), 'static', 'media', outputName))) {
                                    const outputImage = await getIpfsData(outputUri);
                                    if (outputImage) {
                                        // await fs.writeFile(
                                        //     path.join(process.cwd(), 'project', 'media', outputName),
                                        //     outputImage
                                        // );
                                        await fs.writeFile(
                                            path.join(process.cwd(), 'static', 'media', outputName),
                                            outputImage
                                        );
                                    }
                                }
                            }
                        });
                    }


                    

                    

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
                    } else {
                        authors.push(processAuthor(data?.user));
                    }
                    data.authors = authors;

                    //download and store the avatar image for each author
                    for (const author of authors) {
                        if (author.picture) {
                            const avatarImage = await getIpfsData(author.picture);
                            if (avatarImage) {
                                // await fs.writeFile(
                                //     path.join(process.cwd(), 'project', 'media', `author-${author.id}`),
                                //     avatarImage
                                // );
                                await fs.writeFile(
                                    path.join(process.cwd(), 'static', 'media', `author-${author.id}`),
                                    avatarImage
                                );
                            }
                        }
                    }



                    await fs.writeFile(
                        path.join(process.cwd(), 'project', 'fxhash-project.json'),
                        JSON.stringify(data, null, '\t')
                    );

                    processProjectFiles();

                    return data;
                }
			};

		// case 'somethingElse':
		// 	return {
		// 		file: 'something-else.json',
		// 		query: `
		// 			query ($name:String!){
		// 				hotdog(name:$name){
		// 					name price
		// 				}
		// 			}`,
		// 		vars: { name: arg }
		// 	};

		default:
			throw new Error('unknown action');
	}
}

export async function GET({ params }) {
	if (!import.meta.env.DEV) return new Response('Forbidden', { status: 403 });

	const parts = params.slug.split('/');	// e.g. ['updateProject','44124']
	const [action, arg] = parts;

	let actionConfig = null;
	try {
		actionConfig = buildQuery(action, arg);
	} catch {
		return new Response('Bad action', { status: 400 });
	}

	const responseData = await actionConfig.query(actionConfig.vars);
    
    if(actionConfig.postRetrieval) {
        await actionConfig.postRetrieval(responseData);
    }
    // return responseData;
    return json(responseData);
}
