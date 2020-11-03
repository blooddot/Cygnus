/**
 * @Author 雪糕
 * @Description 
 * @Date 2020-09-29 20:39:08
 * @FilePath \Cygnus\src\renderer\demo\WindowWait.ts
 */
import { WindowA } from "./WindowA";

export class WindowWait extends WindowA {

    private _delayTimer: NodeJS.Timeout;

    protected onShown(): void {
        super.onShown();
        this.contentPane.getChild("n5").click(this.loadData, this);
    }

    private loadData(): void {
        this.showModalWait("Loading data...");

        clearTimeout(this._delayTimer);
        this._delayTimer = setTimeout(() => {
            this.closeModalWait();
        }, 3000);
    }

    protected onHide(): void {
        clearTimeout(this._delayTimer);
        this.closeModalWait();
        this.contentPane.getChild("n5").removeClick(this.loadData, this);
    }
}