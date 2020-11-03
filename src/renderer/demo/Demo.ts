/**
 * @Author 雪糕
 * @Description 
 * @Date 2020-09-29 20:39:08
 * @FilePath \Cygnus\src\renderer\demo\Demo.ts
 */
import { LoadingView } from "./LoadingView";
import { WindowA } from "./WindowA";
import { WindowB } from "./WindowB";
import { WindowWait } from "./WindowWait";

export class Demo extends PIXI.Application {

    private _loadingView: LoadingView;
    private _contentLayer: fgui.GComponent;
    private _stats: { update: () => void, dom: HTMLElement };

    public constructor() {

        super({
            view: document.querySelector("#canvasContainer canvas") as HTMLCanvasElement,
            backgroundColor: 0xb5b5b5,
            antialias: true
        });
    }

    public init(): void {
        this._stats = new window["Stats"]();
        document.body.appendChild(this._stats.dom);

        /**global settings */
        fgui.UIConfig.verticalScrollBar = "ui://test/ScrollBar_VT";
        fgui.UIConfig.horizontalScrollBar = "ui://test/ScrollBar_HZ";
        fgui.UIConfig.popupMenu = "ui://test/PopupMenu";
        fgui.UIConfig.globalModalWaiting = "ui://test/GlobalModalWaiting";
        fgui.UIConfig.windowModalWaiting = "ui://test/WindowModalWaiting";

        fgui.GRoot.inst.attachTo(this, {
            designWidth: 1136,
            designHeight: 640,
            scaleMode: fgui.StageScaleMode.FIXED_WIDTH,
            orientation: fgui.StageOrientation.LANDSCAPE,
            alignV: fgui.StageAlign.TOP,
            alignH: fgui.StageAlign.LEFT
        });

        this._contentLayer = new fgui.GComponent();
        fgui.GRoot.inst.addChild(this._contentLayer);

        this._contentLayer.addChild(this._loadingView = new LoadingView());
        this._loadingView.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        this._loadingView.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);

        //test.jpg actually is a binary file but just ends with fake postfix.
        const loader = new fgui.utils.AssetLoader();
        loader.add("test", "demo/images/test.jpg", { loadType: PIXI.loaders.Resource.LOAD_TYPE.XHR, xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
            .add("test@atlas0", "demo/images/test@atlas0.png")
            .add("test@atlas0_1", "demo/images/test@atlas0_1.png")
            .add("test@atlas0_2", "demo/images/test@atlas0_2.png")
            .add("test@atlas0_3", "demo/images/test@atlas0_3.png")
            .add("test@atlas0_4", "demo/images/test@atlas0_4.png")
            .on("progress", this.loadProgress, this)
            .on("complete", this.resLoaded, this)
            .load();
    }

    private loadProgress(tLoader: PIXI.loaders.Loader): void {
        const p = tLoader.progress;
        this._loadingView.setProgress(p);
        if (p >= 100) {
            tLoader.off("progress", this.loadProgress, this);
            this._loadingView.dispose();
            this._loadingView = null;
        }
    }

    private resLoaded(tLoader: PIXI.loaders.Loader): void {

        tLoader.destroy();

        fgui.UIPackage.addPackage("test");

        const ins = fgui.UIPackage.createObject("test", "main") as fgui.GComponent;
        ins.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        ins.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
        this._contentLayer.addChild(ins);
        this.initClicks(ins);
    }

    private renderFunc(tIndex: number, tItem: fgui.GObject): void {
        tItem.text = tIndex.toString();
    }

    private _mainIns: fgui.GComponent;
    private _container: fgui.GComponent;
    private _currentDemo: fgui.GComponent;
    private _progressDemoHandler: (deltaTime: number) => void;
    private _textResizeHandler: (deltaTime: number) => void;

    private initClicks(tIns: fgui.GComponent): void {

        this._mainIns = tIns;
        tIns.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        tIns.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
        this._container = tIns.getChild("container") as fgui.GComponent;

        for (let i = 0; i < tIns.numChildren; i++) {
            const c = tIns.getChildAt(i);
            const cname = c.name;
            if (fgui.utils.StringUtil.startsWith(cname, "btn_")) {
                if (cname == "btn_back") c.click(this.backToMenu, this);
                else c.click(this.runDemo, this);
            }
        }
    }

    private runDemo(tEvt: PIXI.interaction.InteractionEvent): void {
        const name = fgui.GObject.castFromNativeObject(tEvt.currentTarget).name.replace("btn_", "");
        if (this._currentDemo) {
            if (this._currentDemo.name == name) {
                this._mainIns.getController("c1").selectedIndex = 1;
                return;
            }
            this._currentDemo.dispose();
            this._container.removeChild(this._currentDemo);
            this._currentDemo = null;
        }
        this._currentDemo = fgui.UIPackage.createObjectFromURL(`ui://test/${name}`) as fgui.GComponent;
        this._currentDemo.name = name;
        this._currentDemo.setSize(this._container.width, this._container.height);
        this._currentDemo.addRelation(this._container, fgui.RelationType.Size);
        this._container.addChild(this._currentDemo);
        this.initDemo(name, this._currentDemo);
        this._mainIns.getController("c1").selectedIndex = 1;
    }

    private initDemo(tName: string, tIns: fgui.GComponent): void {
        switch (tName) {
            case "text":
                this._textResizeHandler = fgui.utils.Binder.create(this.onPlayText, this, tIns);
                this.ticker.add(this._textResizeHandler, this);
                break;
            case "window":
                this.playWindow(tIns);
                break;
            case "popup":
                this.playPopup(tIns);
                break;
            case "grid":
                this.playGrid(tIns);
                break;
            case "drag_drop":
                this.playDragDrop(tIns);
                break;
            case "progressbar":
                this._progressDemoHandler = fgui.utils.Binder.create(this.onPlayProgress, this, tIns);
                this.ticker.add(this._progressDemoHandler, this);
                break;
            case "depth":
                const testContainer = tIns.getChild("n22") as fgui.GComponent;
                const fixedObj = testContainer.getChild("n0");
                fixedObj.sortingOrder = 100;
                fixedObj.draggable = true;
                const startPos: PIXI.Point = new PIXI.Point(fixedObj.x, fixedObj.y);
                tIns.getChild("btn0").click((tEvt) => {
                    this.onClick1(tEvt, tIns, startPos);
                }, this);
                tIns.getChild("btn1").click((tEvt) => {
                    this.onClick2(tEvt, tIns, startPos);
                }, this);
                break;
            default:
                break;
        }
    }

    private disposeDemo(): void {
        const ins = this._currentDemo;
        switch (ins.name) {
            case "progressbar":
                this.ticker.remove(this._progressDemoHandler, this);
                this._progressDemoHandler = null;
                break;
            case "text":
                this.ticker.remove(this._textResizeHandler, this);
                this._textResizeHandler = null;
                break;
            default:
                break;
        }
    }

    private backToMenu(tEvt: PIXI.interaction.InteractionEvent): void {
        this.disposeDemo();
        this._mainIns.getController("c1").selectedIndex = 0;
    }

    //-----grid--------------------
    private playGrid(tIns: fgui.GComponent): void {
        const list1: fgui.GList = tIns.getChild("list1") as fgui.GList;
        list1.removeChildrenToPool();
        const testNames: string[] = ["iOS", "Android", "WinPhone", "PC", "Mac", "Unknown"];
        const testColors: number[] = [0xFFFF00, 0x660033, 0xFFFFFF, 0x123456];
        testNames.forEach((tN, tI) => {
            const item: fgui.GButton = list1.addItemFromPool() as fgui.GButton;
            item.getChild("t0").text = String(tI + 1);
            item.getChild("t1").text = testNames[tI];
            (item.getChild("t2") as fgui.GTextField).color = testColors[Math.floor(Math.random() * 4)];
            (item.getChild("star") as fgui.GProgressBar).value = (Math.floor(Math.random() * 3) + 1) / 3 * 100;
        });
        const list2: fgui.GList = tIns.getChild("list2") as fgui.GList;
        list2.removeChildrenToPool();
        testNames.forEach((tN, tI) => {
            const item: fgui.GButton = list2.addItemFromPool() as fgui.GButton;
            const cb = item.getChild("cb") as fgui.GButton;
            cb.selected = false;
            (item.getChild("mc") as fgui.GMovieClip).playing = false;
            cb.on(fgui.StateChangeEvent.CHANGED, this.gridChkChanged, this);
            item.getChild("t1").text = testNames[tI];
            item.getChild("t3").text = String(Math.floor(Math.random() * 10000));
        });
    }
    private gridChkChanged(tTarget: fgui.GButton): void {
        (tTarget.parent.getChild("mc") as fgui.GMovieClip).playing = tTarget.selected;
    }

    //-----depth--------------------
    private onClick1(tEvt: PIXI.interaction.InteractionEvent, tObj: fgui.GComponent, tStartPos: PIXI.Point): void {
        const graph: fgui.GGraph = new fgui.GGraph();
        tStartPos.x += 10;
        tStartPos.y += 10;
        graph.setXY(tStartPos.x, tStartPos.y);
        graph.setSize(150, 150);
        graph.drawRect(1, 0x000000, 1, 0xFF0000, 1);
        (tObj.getChild("n22") as fgui.GComponent).addChild(graph);
    }

    private onClick2(tEvt: PIXI.interaction.InteractionEvent, tObj: fgui.GComponent, tStartPos: PIXI.Point): void {
        const graph: fgui.GGraph = new fgui.GGraph();
        tStartPos.x += 10;
        tStartPos.y += 10;
        graph.setXY(tStartPos.x, tStartPos.y);
        graph.setSize(150, 150);
        graph.drawRect(1, 0x000000, 1, 0x00FF00, 1);
        graph.sortingOrder = 200;
        (tObj.getChild("n22") as fgui.GComponent).addChild(graph);
    }

    //-----------progressbar-------------------------
    private onPlayProgress(tDelta: number, tP: fgui.GComponent): void {
        const cnt: number = tP.numChildren;
        for (let i: number = 0; i < cnt; i++) {
            const child: fgui.GProgressBar = tP.getChildAt(i) as fgui.GProgressBar;
            if (child != null) {
                child.value += 0.5 * tDelta;
                if (child.value > child.max) child.value = 0;
            }
        }
    }

    //-----------text-------------------------
    private _textSizeWidth: number = 337;
    private _textSizeDir: number = -1;
    private onPlayText(tDelta: number, tP: fgui.GComponent): void {
        if (this._textSizeWidth < 80) this._textSizeDir = 1;
        else if (this._textSizeWidth > 337) this._textSizeDir = -1;
        this._textSizeWidth += this._textSizeDir;
        tP.getChild("n24").width = tP.getChild("n23").width = this._textSizeWidth;
        tP.getChild("n22").removeClick(this.onGetInputText, this);
        tP.getChild("n22").click(this.onGetInputText, this);
    }
    private onGetInputText(tEvt: PIXI.interaction.InteractionEvent): void {
        const p = fgui.GObject.castFromNativeObject(tEvt.currentTarget).parent as fgui.GComponent;
        p.getChild("resulttxt").text = p.getChild("inputbox").text;
    }

    //------------drag&drop-----------------------------
    private _ddi: fgui.utils.DragIndicator;

    private playDragDrop(tIns: fgui.GComponent): void {
        const btnA: fgui.GObject = tIns.getChild("a");
        btnA.draggable = true;

        const btnB: fgui.GButton = tIns.getChild("b") as fgui.GButton;
        btnB.draggable = true;
        btnB.on(fgui.DragEvent.START, this.onDragStart, this);

        const btnC: fgui.GButton = tIns.getChild("c") as fgui.GButton;
        btnC.icon = null;
        btnC.on(fgui.DragEvent.DROP, this.onDrop, this);

        const btnD: fgui.GObject = tIns.getChild("d");
        btnD.draggable = true;
        const bounds: fgui.GObject = tIns.getChild("bounds");
        const rect: PIXI.Rectangle = new PIXI.Rectangle();
        bounds.localToGlobalRect(0, 0, bounds.width, bounds.height, rect);
        fgui.GRoot.inst.globalToLocalRect(rect.x, rect.y, rect.width, rect.height, rect);
        rect.x -= tIns.parent.x;   //the panel is moving, so fix it with parent.x
        btnD.dragBounds = rect;
    }

    private onDragStart(tEvt: PIXI.interaction.InteractionEvent): void {
        const btn = fgui.GObject.castFromNativeObject(tEvt.currentTarget);
        btn.stopDrag();
        if (!this._ddi) this._ddi = new fgui.utils.DragIndicator();
        this._ddi.startDrag(btn, btn.icon, btn.icon, tEvt.data.pointerID);
    }

    private onDrop(tEvt: PIXI.interaction.InteractionEvent, tData: string): void {
        const btn: fgui.GButton = fgui.GObject.castFromNativeObject(tEvt.currentTarget) as fgui.GButton;
        btn.icon = tData;
    }

    //-------window--------------------------------
    private _winA: fgui.Window;
    private _winB: fgui.Window;
    private _winW: fgui.Window;

    private playWindow(tIns: fgui.GComponent): void {
        tIns.getChild("n0").click(this.onClickWindowA, this);
        tIns.getChild("n1").click(this.onClickWindowB, this);
        tIns.getChild("n2").click(this.onClickWindowC, this);
        tIns.getChild("n3").click(this.onclickRootWait, this);
        tIns.getChild("n4").click(this.onClickWindowWait, this);
    }

    private onClickWindowA(): void {
        if (this._winA == null) this._winA = new WindowA();
        this._winA.modal = false;
        this._winA.show();
    }

    private onClickWindowB(): void {
        if (this._winB == null) this._winB = new WindowB();
        this._winB.show();
    }

    private onClickWindowC(): void {
        if (this._winA == null) this._winA = new WindowA();
        this._winA.modal = true;
        this._winA.show();
    }

    private onclickRootWait(): void {
        fgui.GRoot.inst.showModalWait("Please wait while loading...");
        setTimeout(() => {
            fgui.GRoot.inst.closeModalWait();
        }, 3000);
    }

    private onClickWindowWait(): void {
        if (this._winW == null) this._winW = new WindowWait();
        this._winW.show();
    }

    //-------popup: wait for the accomplishment of the event bubbling system-----------------------
    private _pm: fgui.PopupMenu;
    private _popupCom: fgui.GComponent;
    private playPopup(tIns: fgui.GComponent): void {
        if (this._pm == null) {
            this._pm = new fgui.PopupMenu();
            this._pm.addItem("Item 1");
            this._pm.addItem("Item 2");
            this._pm.addItem("Item 3");
            this._pm.addItem("Item 4");

            if (this._popupCom == null) {
                this._popupCom = fgui.UIPackage.createObject("test", "PopTest1") as fgui.GComponent;
                this._popupCom.center();
            }
        }

        const btn: fgui.GObject = tIns.getChild("n3");
        btn.click(this.onClickPopup1, this);

        const btn2: fgui.GObject = tIns.getChild("n5");
        btn2.click(this.onClickPopup2, this);
    }

    private onClickPopup1(tEvt: PIXI.interaction.InteractionEvent): void {
        const btn: fgui.GObject = fgui.GObject.castFromNativeObject(tEvt.currentTarget);
        this._pm.show(btn, fgui.PopupDirection.Down);
    }

    private onClickPopup2(): void {
        fgui.GRoot.inst.showPopup(this._popupCom);
    }

    public render(): void {
        this._stats.update();
        super.render();
    }
}

//entry