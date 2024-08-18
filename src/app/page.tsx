"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWallet } from "../modules/wallet/wallet-context";

export default function Home() {
	const { wallet } = useWallet();
	const isGameReady = wallet !== null;

	return (
		<main className="min-h-screen relative">
			<iframe
				src="/shoot-balloon/index.html"
				className={"w-full h-full absolute inset-0" + (isGameReady ? "" : " invisible")}
			/>
			<div className={"w-full h-full absolute inset-0 flex flex-col items-center justify-center p-24 bg-black" + (isGameReady ? " invisible" : "")}>
				<ConnectButton />
			</div>
		</main>
	);
}
