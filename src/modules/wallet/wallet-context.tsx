"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useAccount, useBalance, useDisconnect, WagmiProvider } from "wagmi";
import { Balance } from "./domain/balance";
import { Wallet } from "./domain/wallet";
import { config } from "./wagmi";

interface WalletContextProps {
	wallet: Wallet | null;
}

const WalletContext = createContext<WalletContextProps>(null!);

export const useWallet = () => useContext(WalletContext);

const queryClient = new QueryClient();
const channel = new BroadcastChannel("wallet-channel");

function InnerWalletProvider(props: React.PropsWithChildren) {
	const { address, chainId, isConnected } = useAccount();
	const balance = useBalance({ address });
	const { disconnect } = useDisconnect();

	const wallet = useMemo(() => {
		if (isConnected && balance.data) {
			return new Wallet(
				String(chainId!),
				address!,
				new Balance(balance.data?.value!, balance.data?.decimals!, balance.data?.symbol!)
			);
		}

		return null;
	}, [isConnected, address, chainId, balance]);

	useEffect(() => {
		if (!wallet) {
			return;
		}

		const handleMessage = (event: MessageEvent) => {
			if (event.data.type === "update-wallet") {
				channel.postMessage({ type: "wallet-updated", wallet: wallet });
			}

			if (event.data.type === "disconnect-wallet") {
				disconnect();
			}
		};

		channel.addEventListener("message", handleMessage);
		channel.postMessage({ type: "wallet-updated", wallet: wallet });

		return () => {
			channel.removeEventListener("message", handleMessage);
		};
	}, [wallet, disconnect]);

	return <WalletContext.Provider value={{ wallet }}>{props.children}</WalletContext.Provider>;
}

export function WalletProvider(props: React.PropsWithChildren) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>
					<InnerWalletProvider>{props.children}</InnerWalletProvider>
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
