/** @jsxImportSource frog/jsx */
import { Button, Frog } from "frog";
import { handle } from "frog/next";
import { PinataFDK } from "pinata-fdk";
import { getConnectedAddressForUser } from "@/utils/fc";
import { mintNft, isMaxSupplyReached, hasPreviouslyOwned } from "@/utils/mint";
import { getBalance, channel, reactions} from "@/app/gql/tokenbalance";

const fdk = new PinataFDK({
  pinata_jwt: process.env.PINATA_JWT || "",
  pinata_gateway: "",
});

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  browserLocation: "https://opensea.io/collection/based-puppy"
});

app.frame('/', (c) => {
  return c.res({
    image: "https://bronze-cautious-eagle-534.mypinata.cloud/ipfs/QmR4bcKnUYnJaHwCzLqasHBbyeAcn7pyBWWSN1Pwn1J1Cj",
    imageAspectRatio: "1:1",
    intents: [
      <Button action="/try">GULP</Button>,
    ],
  })
});


interface Reaction {
  fid: number;
  id: string;
}

app.frame('/try', async (c) => {
  const req = c.req;
  const body = await req.json();
  const userFid = body.untrustedData.fid;
  const userEthereumAddress = await getConnectedAddressForUser(userFid);;
  const tokenId = 0;
  const isMaxedOut = await isMaxSupplyReached(tokenId);

  try {
    if (process.env.AIRSTACK_API_KEY) {
      const balanceQuery = getBalance(userEthereumAddress);
      const channelQuery = channel(userFid);
      const likeQuery = reactions();

      const response = await fetch(`https://api.airstack.xyz/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': process.env.AIRSTACK_API_KEY,
        },
        body: JSON.stringify({ query: balanceQuery })
      });

      const channelResponse = await fetch(`https://api.airstack.xyz/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': process.env.AIRSTACK_API_KEY,
        },
        body: JSON.stringify({ query: channelQuery })
      });

      const likeResponse = await fetch(`https://api.airstack.xyz/gql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': process.env.AIRSTACK_API_KEY,
        },
        body: JSON.stringify({ query: likeQuery })
      });

      const { data: balanceData } = await response.json();
      const { data: channelData } = await channelResponse.json();
      const { data: likeData } = await likeResponse.json();
      
      const balance = balanceData.TokenBalances.TokenBalance[0]?.amount ?? 0;
      const qualified = parseInt(balance, 10) > 4999999999999999999999;

      const isFollowing = channelData.FarcasterChannelParticipants.FarcasterChannelParticipant
        .some((participant: { channelId: string; }) => participant.channelId === 'basegulp');

        const hasLiked = likeData.FarcasterReactions.Reaction.some(
          (reaction: { reactedBy: { userId: string } }) => reaction.reactedBy.userId === String(userFid)
        );
  
        const hasRecast = likeData.FarcasterReactions2.Reaction.some(
          (reaction: { reactedBy: { userId: string } }) => reaction.reactedBy.userId === String(userFid)
        );


      if (!qualified) {
        return c.res({
          image: "https://bronze-cautious-eagle-534.mypinata.cloud/ipfs/QmPkD1KCTQEacWvsp96xu22LLLUCZej6nrSqB71SJ1rpCc",
          imageAspectRatio: "1:1",
          intents: [
            <Button action="/">go back</Button>,
            <Button.Link href="https://uniswap.">
              Buy $HIGHER
            </Button.Link>,
          ],
          title: "Does not hold >5000 $HIGHER",
        });
      }

      if (!isFollowing) {
        return c.res({
          image: "https://bronze-cautious-eagle-534.mypinata.cloud/ipfs/QmPkD1KCTQEacWvsp96xu22LLLUCZej6nrSqB71SJ1rpCc",
          imageAspectRatio: "1:1",
          intents: [
            <Button action="/">go back</Button>,
            <Button.Link href="https://warpcast.com/~/channel/basegulp">
              /basegulp
            </Button.Link>,
          ],
          title: "Has not followed channel",
        });
      }

      if (!hasRecast || !hasLiked) {
        return c.res({
          image: "https://bronze-cautious-eagle-534.mypinata.cloud/ipfs/QmPkD1KCTQEacWvsp96xu22LLLUCZej6nrSqB71SJ1rpCc",
          imageAspectRatio: "1:1",
          intents: [
            <Button action="/">go back</Button>,
          ],
          title: "Has not Liked or Recast",
        });
      }

      if (isMaxedOut) {
        return c.res({
          image: "https://bronze-cautious-eagle-534.mypinata.cloud/ipfs/QmdWtwB5Dh3DFbmtgHdWLMK8sHqmsSa79NVVMSXfcGQu2n",
          imageAspectRatio: "1:1",
          intents: [
            <Button.Link href="https://opensea.io">
              OpenSea
            </Button.Link>,
            <Button.Link href="https://warpcast.com/~/channel/basegulp">
              /basegulp
            </Button.Link>,
            <Button action="/">go back</Button>,
          ],
          title: "NFT sold out",
        });
      } 
      
      const hasOwned = await hasPreviouslyOwned(userEthereumAddress, tokenId);
      if (hasOwned) {
        return c.res({
          image: "https://bronze-cautious-eagle-534.mypinata.cloud/ipfs/QmUchyDbLcEdFJFKRtELysxQxtrzCH582Ffpgx44Hx3FQB",
          imageAspectRatio: "1:1",
          intents: [
            <Button.Link href="https://opensea.io">
              OpenSea
            </Button.Link>,
            <Button.Link href="https://warpcast.com/~/channel/basegulp">
              /basegulp
            </Button.Link>,
            <Button action="/">go back</Button>,
          ],
          title: "NFT already minted",
        });
      }

        const mint = await mintNft(userEthereumAddress, tokenId);
        console.log(mint);
        return c.res({
          image: "https://bronze-cautious-eagle-534.mypinata.cloud/ipfs/QmZ61Z8jU8dsq2FKe2CKP7oUKUiXr9LPzfSJWM26NPTgPb",
          imageAspectRatio: "1:1",
          intents: [
            <Button.Link href="https://opensea.io">
              OpenSea
            </Button.Link>,
            <Button.Link href="https://warpcast.com/~/channel/basegulp">
              /basegulp
            </Button.Link>,
          ],
          title: "Success",
        });

    } else {
      throw new Error('AIRSTACK_API_KEY not set');
    }
  } catch (error) {
    // Error handling
    return c.res({
      image: "https://bronze-cautious-eagle-534.mypinata.cloud/ipfs/QmPkD1KCTQEacWvsp96xu22LLLUCZej6nrSqB71SJ1rpCc",
      imageAspectRatio: "1:1",
      intents: [
        <Button action="/">error - go back</Button>,
      ]
    });
  }
});

export const GET = handle(app)
export const POST = handle(app)