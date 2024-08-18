import {
	_decorator,
	AudioClip,
	AudioSource,
	Camera,
	CCInteger,
	Component,
	director,
	game,
	geometry,
	Input,
	input,
	instantiate,
	Label,
	Node,
	PhysicsSystem,
	Prefab,
	randomRange,
	screen,
} from "cc";
const { ccclass, property } = _decorator;

const ray = new geometry.Ray();

@ccclass("ShootBalloon")
export class ShootBalloon extends Component {
	@property({ type: CCInteger })
	public readyCountdown: number = 3;

	@property({ type: CCInteger })
	public gameCountdown: number = 60;

	@property({ type: CCInteger })
	public spawnCount: number = 5;

	@property({ type: CCInteger })
	public spawnInterval: number = 1;

	@property({ type: Label })
	public readyCountdownLabel: Label = null;

	@property({ type: Label })
	public gameCountdownLabel: Label = null;

	@property({ type: Label })
	public scoreLabel: Label = null;

	@property({ type: Label })
	public resultScoreLabel: Label = null;

	@property({ type: Prefab })
	public balloonPrefab: Prefab = null;

	@property({ type: Camera })
	public mainCamera: Camera = null;

	@property({ type: Node })
	public crosshairNode: Node = null;

	@property({ type: AudioClip })
	public hitAudioClip: AudioClip = null;

	@property({ type: Node })
	public resultPanelNode: Node = null;

	private audioSource: AudioSource = null;

	private gameStarted: boolean = false;

	private timeRemaining: number = 0;

	private nextBalloonSpawnTime: number = 0;

	private radius: number = 5;

	private yMin: number = -10;

	private yMax: number = 10;

	private speed: number = 1;

	private score: number = 0;

	onLoad() {
		this.readyCountdownLabel.node.active = true;
		this.gameCountdownLabel.node.active = false;
		this.resultPanelNode.active = false;
		this.scoreLabel.node.active = false;
		this.crosshairNode.active = false;
		this.audioSource = this.node.getComponent(AudioSource);
	}

	start() {
		this.initEvent();

		let currentReadyCountdown = this.readyCountdown;
		this.readyCountdownLabel.string = String(currentReadyCountdown);

		this.schedule(
			() => {
				currentReadyCountdown--;

				if (currentReadyCountdown < 0) {
					this.gameStart();
					return;
				}

				this.readyCountdownLabel.string = currentReadyCountdown === 0 ? "GO" : String(currentReadyCountdown);
			},
			1,
			this.readyCountdown
		);
	}

	update(deltaTime: number) {
		if (this.node.children.length > 0) {
			const reversedChildren = Array.from(this.node.children).reverse();

			reversedChildren.forEach((node) => {
				if (node.position.y < this.yMax) {
					const position = node.getPosition();
					position.y += this.speed * deltaTime;
					node.setPosition(position);
				} else {
					node.destroy();
				}
			});
		}

		if (!this.gameStarted) {
			return;
		}

		if (this.timeRemaining <= 0) {
			this.gameEnd();
			return;
		}

		this.timeRemaining -= deltaTime;

		if (this.timeRemaining < this.nextBalloonSpawnTime) {
			this.nextBalloonSpawnTime -= this.spawnInterval;

			for (let i = 0; i < this.spawnCount; i++) {
				this.spawnBalloon();
			}
		}

		this.gameCountdownLabel.string = String(Math.ceil(this.timeRemaining));
	}

	private gameEnd() {
		this.gameStarted = false;
		this.resultScoreLabel.string = `擊中: ${String(this.score).padStart(3, " ")}`;
		this.resultPanelNode.active = true;
		this.gameCountdownLabel.node.active = false;
		this.scoreLabel.node.active = false;
		document.exitPointerLock();
	}

	gameStart() {
		this.gameCountdownLabel.node.active = true;
		this.scoreLabel.node.active = true;
		this.readyCountdownLabel.node.active = false;
		this.crosshairNode.active = true;
		this.resultPanelNode.active = false;

		this.gameStarted = true;
		this.score = 0;
		this.timeRemaining = this.gameCountdown;
		this.nextBalloonSpawnTime = this.gameCountdown;
		this.gameCountdownLabel.string = String(this.gameCountdown);
		this.scoreLabel.string = `擊中: ${String(this.score).padStart(3, " ")}`;
	}

	private spawnBalloon(): void {
		const node = instantiate(this.balloonPrefab);

		const rad = (randomRange(0, 360) * Math.PI) / 180;
		const x = this.radius * Math.cos(rad);
		const z = this.radius * Math.sin(rad);

		node.setPosition(x, this.yMin, z);
		node.setParent(this.node);
	}

	private initEvent() {
		input.on(Input.EventType.MOUSE_DOWN, (eventMouse) => {
			if (!document.pointerLockElement && !director.isPaused()) {
				game.canvas.requestPointerLock();
			}
		});

		input.on(Input.EventType.MOUSE_DOWN, (eventMouse) => {
			this.mainCamera.screenPointToRay(screen.windowSize.width / 2, screen.windowSize.height / 2, ray);

			const mask = 0xffffffff;
			const maxDistance = 100;
			const queryTrigger = true;

			if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
				const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
				if (raycastClosestResult.collider.node.name == "Balloon") {
					this.hitBalloon(raycastClosestResult.collider.node);
				}
			}
		});
	}

	private hitBalloon(node: Node) {
		node.destroy();
		this.score++;
		this.scoreLabel.string = `擊中: ${String(this.score).padStart(3, " ")}`;
		this.audioSource.playOneShot(this.hitAudioClip);
	}

	home() {
		director.loadScene("Home");
	}

	retry() {
		director.loadScene("Game");
	}

	protected onDestroy(): void {
		input.off(Input.EventType.MOUSE_DOWN);
	}
}
