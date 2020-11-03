/**
 * @Author 雪糕
 * @Description 渲染进程逻辑类
 * @Date 2020-02-18 11:44:51
 * @FilePath \Cygnus\src\renderer\Renderer.ts
 */
// import { Demo } from "./demo/Demo";
// const demo = new Demo();
// demo.init();

//Create the renderer
const renderer = PIXI.autoDetectRenderer({ width: 256, height: 256 });

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);

//Create a container object called the`stage`
const stage = new PIXI.Container();

//Tell the`renderer` to`render` the`stage`
renderer.render(stage);

import { parseString } from "xml2js";
import fse from "fs-extra";
class Test {
    public init(): void {
        this.onInit();
    }

    private async onInit(): Promise<void> {
        const content = await fse.readFileSync("D:/bellcode/git/Client/UI_Project/assets/ide/timeline/ComTimelineEditor.xml");
        parseString(content, (tErro: Error, tResult: unknown) => {
            console.dir(tResult);
        });

    }
}

const test = new Test();
test.init();