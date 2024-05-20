import { createWalletClient, http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import contractAbi from "./abi.json";
const contractAddress = process.env.CONTRACT_ADDRESS as `0x`;

const account = privateKeyToAccount((process.env.PRIVATE_KEY as `0x`) || "");

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.ALCHEMY_URL),
});

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(process.env.ALCHEMY_URL),
});

export async function mintNft(toAddress: string, tokenId: number) {
  try {
    const { request }: any = await publicClient.simulateContract({
      account,
      address: contractAddress,
      abi: contractAbi.output.abi,
      functionName: "mint",
      args: [toAddress, tokenId, 1, `0x`],
    });
    const transaction = await walletClient.writeContract(request);
    return transaction;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function hasPreviouslyOwned(toAddress: string, tokenId: number): Promise<boolean> {
  try {
    const ownershipData = await publicClient.readContract({
      address: contractAddress,
      abi: contractAbi.output.abi,
      functionName: "transferHistory",
      args: [tokenId, toAddress as `0x`]
    });
    const hasOwned: boolean = Boolean(ownershipData);
    return hasOwned;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function isMaxSupplyReached(tokenId: number): Promise<boolean> {
  try {
    const supplyData = await publicClient.readContract({
      address: contractAddress,
      abi: contractAbi.output.abi,
      functionName: "supplies",
      args: [tokenId]
    });
    const mintedData = await publicClient.readContract({
      address: contractAddress,
      abi: contractAbi.output.abi,
      functionName: "minted",
      args: [tokenId]
    });

    const maxSupply: number = Number(supplyData);
    const mintedAmount: number = Number(mintedData);

    return mintedAmount >= maxSupply;
  } catch (error) {
    console.log(error);
    return false;
  }
}