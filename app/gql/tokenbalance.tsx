import { init } from "@airstack/airstack-react";

init(process.env.AIRSTACK_API_KEY as string);

export const getBalance = (address: string) => `
    query {
        TokenBalances(
            input: {filter: 
                {owner: 
                    {_in: "${address}"}, 
                    tokenAddress: {_in: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe"}, 
                    tokenType: {_eq: ERC20}}, 
                    blockchain: base, 
                    limit: 200}
          ) {
            TokenBalance {
              owner {
                addresses
              }
              tokenAddress
              amount
              blockchain
              tokenType
            }
          }
    }
`

export const channel= (user: string) => `
query {
  FarcasterChannelParticipants(
    input: {filter: {participant: {_eq: "fc_fid:${user}"}}, blockchain: ALL, limit: 200}
  ) {
    FarcasterChannelParticipant {
      channelId
    }
  }
}
`

export const reactions= () => `
query MyQuery {
  FarcasterReactions(
    input: {
      filter: {
        criteria: liked, 
        castUrl: {_eq: "https://warpcast.com/diviflyy/0x79c84e07"}
      }, 
      blockchain: ALL, 
      limit: 200
    }
  ) {
    Reaction {
      reactedBy {
        userId
      }
    }
  }
  FarcasterReactions2: FarcasterReactions(
    input: {
      filter: {
        criteria: recasted, 
        castUrl: {_eq: "https://warpcast.com/diviflyy/0x79c84e07"}
      }, 
      blockchain: ALL, 
      limit: 200
    }
  ) {
    Reaction {
      reactedBy {
        userId
      }
    }
  }
}
`