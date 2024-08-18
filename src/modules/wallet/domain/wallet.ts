import { Balance } from "./balance";

export class Wallet {
	constructor(public readonly chainId: string, public readonly address: string, public balance: Balance) {}
}
