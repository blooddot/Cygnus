/**
 * @Author 雪糕
 * @Description 
 * @Date 2020-09-29 20:39:08
 * @FilePath \Cygnus\src\renderer\demo\LoadingView.ts
 */
export class LoadingView extends fgui.GComponent {

    public constructor() {
        super();
        this.createView();
    }

    private _textField: fgui.GTextField;

    private createView(): void {
        this._textField = new fgui.GTextField();
        this._textField.width = 500;
        this._textField.fontSize = 26;
        this._textField.x = this._textField.width * 0.5;
        this._textField.y = this._textField.height * 0.5 - 40;
        this.addChild(this._textField);

        this._textField.addRelation(this, fgui.RelationType.Center_Center);
        this._textField.addRelation(this, fgui.RelationType.Middle_Middle);
    }

    public setProgress(tP: number): void {
        this._textField.text = `Loading...${Math.round(tP)}%`;
    }
}
