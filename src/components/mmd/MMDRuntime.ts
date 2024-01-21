import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";

export interface ISceneBuilder {
    build(canvas: HTMLCanvasElement, engine: Engine, mmdAliveUrl: string, mmdModel: string): Scene | Promise<Scene>;
}

export interface BaseRuntimeInitParams {
    canvas: HTMLCanvasElement;
    engine: Engine;
    sceneBuilder: ISceneBuilder;
    mmdAliveUrl: string; 
    mmdModel: string;
}

export class BaseRuntime {
    private readonly _canvas: HTMLCanvasElement;
    private readonly _engine: Engine;
    private readonly _mmdAliveUrl: string; 
    private readonly _mmdModel: string;
    private _scene: Scene;
    private _onTick: () => void;

    private constructor(params: BaseRuntimeInitParams) {
        this._canvas = params.canvas;
        this._engine = params.engine;
        this._mmdAliveUrl = params.mmdAliveUrl;
        this._mmdModel = params.mmdModel;
        console.log("this._canvas.height ", this._canvas.height);

        this._scene = null!;
        this._onTick = null!;
    }

    public static async Create(params: BaseRuntimeInitParams): Promise<BaseRuntime> {
        const runtime = new BaseRuntime(params);
        runtime._scene = await runtime._initialize(params.sceneBuilder);
        runtime._onTick = runtime._makeOnTick();
        return runtime;
    }

    public run(): void {
        const engine = this._engine;

        window.addEventListener("resize", this._onResize);
        engine.runRenderLoop(this._onTick);
    }

    public dispose(): void {
        window.removeEventListener("resize", this._onResize);
        this._engine.dispose();
    }

    private readonly _onResize = (): void => {
        this._engine.resize();
    };

    private async _initialize(sceneBuilder: ISceneBuilder): Promise<Scene> {
        return await sceneBuilder.build(this._canvas, this._engine, this._mmdAliveUrl, this._mmdModel);
    }

    private _makeOnTick(): () => void {
        const scene = this._scene;
        const canvas = this._canvas;
        console.log("scene.clearColor", JSON.stringify(scene.clearColor));
        console.log("canvas.height ", canvas.height);
        return () => scene.render();
    }
}