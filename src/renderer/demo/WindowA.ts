/**
 * @Author 雪糕
 * @Description 
 * @Date 2020-09-29 20:39:08
 * @FilePath \Cygnus\src\renderer\WindowA.ts
 */
export class WindowA extends fgui.Window {
    protected onInit(): void {
        this.contentPane = fgui.UIPackage.createObject("test", "windowA") as fgui.GComponent;
        this.center();
    }

    protected onShown(): void {
        const list: fgui.GList = this.contentPane.getChild("n6") as fgui.GList;
        list.removeChildrenToPool();
        for (let i: number = 0; i < 6; i++) {
            const item: fgui.GButton = list.addItemFromPool() as fgui.GButton;
            item.title = i.toString();
            item.icon = fgui.UIPackage.getItemURL("test", "r4");
        }
    }
}