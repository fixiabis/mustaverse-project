import { _decorator, Component, director, game, Label, Node } from "cc";
import { EDITOR } from "cc/env";
const { ccclass, property } = _decorator;

@ccclass("HomeController")
export class HomeController extends Component {
	@property({ type: Label })
	public addressLabel: Label = null;

	@property({ type: Label })
	public balanceLabel: Label = null;

	private channel: BroadcastChannel;

	private handleMessage = (event: MessageEvent) => {
		if (event.data.type === "wallet-updated") {
			console.log(event.data.wallet);
			this.addressLabel.string = event.data.wallet.address.slice(0, 6) + "..." + event.data.wallet.address.slice(-4);
			this.balanceLabel.string = event.data.wallet.balance.formatted;
		}
	};

	start() {
		if (!EDITOR) {
			this.channel = new BroadcastChannel("wallet-channel");
			this.channel.addEventListener("message", this.handleMessage);
			this.channel.postMessage({ type: "update-wallet" });
		}
	}

	play() {
		director.loadScene("Game");
		game.canvas.requestPointerLock();
	}

	disconnect() {
		this.channel.postMessage({ type: "disconnect-wallet" });
	}

	onDestroy() {
		if (!EDITOR) {
			this.channel.removeEventListener("message", this.handleMessage);
		}
	}
}
