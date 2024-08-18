export class Balance {
	public readonly value: bigint;
	public readonly decimals: number;
	public readonly symbol: string;
	public readonly formatted: string;

	constructor(value: bigint, decimals: number, symbol: string) {
		this.value = value;
		this.decimals = decimals;
		this.symbol = symbol;
		this.formatted = this.format();
	}

	private format(): string {
		const decimals = this.decimals;
		const value = this.value.toString().padStart(decimals + 1, "0");
		const beforeDecimal = value.slice(0, -decimals).padStart(1, "0");
		const afterDecimal = value.slice(-decimals).replace(/(?<!^)0+$/, "");
		return `${beforeDecimal}.${afterDecimal}`;
	}
}
