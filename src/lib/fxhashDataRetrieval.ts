//fxhash graph queries etc

const graphUrl = 'https://api.v2.fxhash.xyz/v1/graphql';



export async function getObjktBySlug({slug}) {
  console.log('fxhash getObjktBySlug', {slug});
    const query = `
query ObjktBySlug($where: objkt_bool_exp = {}) {
  onchain {
    objkt(limit: 1, where: $where) {
      id
      features
      display_uri
      name
      owner_id
      thumbnail_uri
      rarity
      input_bytes
      generation_hash
      minter {
        name
        id
      }
      royalties
      slug
      state
      updated_at
      minted_price
      iteration
      version
      created_at
    }
  }
}`;
    const variables = {
        where: {
            slug: { _eq: slug }
        }
    };  
    const response = await fetch(graphUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables })
    });
    const data = await response.json();
    // console.log('fxhash data', {data});
    // return data;
    return data.data.onchain.objkt?.[0];
}


export async function getProjectData({projectId}) {
    const query = `
query ProjectData($where: generative_token_bool_exp) {
  onchain {
    generative_token(where: $where) {
      author {
        description
        created_at
        metadata
        collaborations {
          collaborator {
            name
            id
            avatar_uri
            wallet_account {
              account {
                username
                profile {
                  picture
                  instagram
                  website
                  twitter
                }
              }
            }
          }
        }
        id
        name
        avatar_uri
        type
        wallet {
          network
          address
          accountId
        }
      }
      mint_opens_at
      name
      open_editions
      open_editions_ends_at
      original_supply
      royalties
      slug
      splits_secondary {
        user_id
        id
        objkt_id
        pct
        generative_token_primary_id
        generative_token_secondary_id
        article_id
      }
      chain
      created_at
      enabled
      features
      iterations_count
      locked_seconds
      lock_end
      labels
      market_stat {
        floor
        floor_change24
        floor_change30d
        floor_change7d
      }
      thumbnail_uri
      version
      metadata
      art_coin_id
      balance
      codex_id
      display_uri
      display_still_uri
      generative_uri
      generative_token_articles {
        article_id
      }
      id
      media_image {
        id
        mime_type
      }
      moderation_reason_id
      objkts {
        id
        display_uri
        features
        name
        owner_id
        thumbnail_uri
        rarity
        input_bytes
        generation_hash
        minter {
          name
          id
        }
        royalties
        slug
        state
        updated_at
        minted_price
        iteration
        version
        created_at
      }
      art_coin {
        name
        display_uri
        description
        author_id
        id
      }
      preview_input_bytes
      user {
        id
        name
        wallet {
          address
        }
        wallet_account {
          account {
            username
            profile {
              picture
              instagram
              website
              twitter
            }
          }
        }
      }
      author_id
      is_frame
      wallet_account {
        user {
          name
        }
      }
      supply
      tags
      _reserves {
        amount
        method
        data
      }
      reserves {
        amount
        method
        data
      }
      redeemed_percentage
      pricing_fixeds {
        price
        opens_at
        mint_fee
        id
        fee_currency
      }
      splits_primary {
        user_id
        pct
      }
      lock_price_for_reserves
      collectors {
        total_collected
        user_id
      }
    }
  }
}


`;
    const variables = {
        where: {
            id: { _eq: String(projectId) }
        }
    };
    const response = await fetch(graphUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables })
    });
    const data = await response.json();
    // console.log('fxhash data', {data});
    return data.data.onchain.generative_token?.[0];
}