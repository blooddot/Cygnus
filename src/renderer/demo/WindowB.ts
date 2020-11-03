/**
 * @Author 雪糕
 * @Description 
 * @Date 2020-09-29 20:39:08
 * @FilePath \Cygnus\src\renderer\demo\WindowB.ts
 */
export class WindowB extends fgui.Window {
    protected onInit(): void {
        this.contentPane = fgui.UIPackage.createObject("test", "windowB") as fgui.GComponent;
        this.center();
        this.setPivot(0.5, 0.5);
    }

    protected doShowAnimation(): void {
        this.setScale(0.1, 0.1);
        createjs.Tween.get(this).to({ scaleX: 1, scaleY: 1 }, 200, createjs.Ease.quadOut).call(this.onShown, null, this);
    }

    protected doHideAnimation(): void {
        createjs.Tween.get(this).to({ scaleX: 0.1, scaleY: 0.1 }, 300, createjs.Ease.backIn).call(this.hideImmediately, null, this);
    }

    protected onShown(): void {
        this.contentPane.getTransition("t1").play();
    }

    protected onHide(): void {
        this.contentPane.getTransition("t1").stop();
    }
}