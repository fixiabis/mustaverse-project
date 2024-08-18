import { _decorator, Component, Node, Vec3, v3, EventMouse, input, Input, EventTouch, game, CCFloat } from "cc";
const { ccclass, property } = _decorator;

@ccclass("CameraController")
export class CameraController extends Component {
	@property({ type: CCFloat })
	public max: number = 89;
	@property({ type: CCFloat })
	public min: number = -89;

	private targetAngle: Vec3 = v3();

	private cameraSensitivity: number = 0.1;

	protected start() {}

	protected lateUpdate(deltaTime: number) {
		//設定滑鼠移動後鏡頭旋轉角度
		this.node.setRotationFromEuler(this.targetAngle);
	}

	private rotate(deltaX: number, deltaY: number) {
		const x = Math.max(Math.min(this.targetAngle.x + deltaX, this.max), this.min);
		this.targetAngle.x = x;

		this.targetAngle.y += deltaY;
		if (this.targetAngle.y < 0) {
			this.targetAngle.y += 360;
		} else if (this.targetAngle.y > 360) {
			this.targetAngle.y -= 360;
		}
	}

	protected onEnable(): void {
		input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
	}

	protected onDisable() {
		input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
	}

	private onMouseMove(event: EventMouse) {
		const delta = event.getDelta();

		// if (!document.pointerLockElement) return;
		if (!delta) return;

		const rx = delta.y * this.cameraSensitivity;
		const ry = -delta.x * this.cameraSensitivity;
		this.rotate(rx, ry);
	}
}
