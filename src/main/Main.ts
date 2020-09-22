/** 
 * @Author 雪糕
 * @Description main主程序文件
 * @Date 2020-02-18 11:42:51
 * @FilePath \Cygnus\src\main\Main.ts
 */
// Modules to control application life and create native browser window
import { app, globalShortcut, BrowserWindow, Menu, shell, dialog, webContents } from 'electron';
import * as process from 'process';
import { Project, StructureKind } from "ts-morph";

class Main {
    private _mainWindow: BrowserWindow;
    public init(): void {
        //监听app事件
        app.on('ready', this.onAppReady.bind(this));
        app.on('second-instance', this.onAppSecondInstance.bind(this));
        app.on('window-all-closed', this.onAppWindowAllClosed.bind(this));
        app.on('activate', this.onAppActivate.bind(this));
    }

    private onAppReady(): void {
        this.createWindow();



        let shortCut = "";
        if (process.platform === 'darwin') {
            shortCut = 'Alt+Command+I';
        } else {
            shortCut = 'Ctrl+Shift+I';
        }
        globalShortcut.register(shortCut, () => {
            this._mainWindow.webContents.openDevTools();
        });
    }

    // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
    private onAppSecondInstance(tEvent: Event, tArgv: string[], tWorkingDirectory: string): void {
        if (process.platform === 'win32') {
            this.showSecondInstanceAlert();
        }
    }

    private showSecondInstanceAlert(): void {
        const options = {
            type: 'warning',
            title: '提示',
            message: '小贝星球星球正在运行中!',
            buttons: ['确定'],
        };
        dialog.showMessageBoxSync(this._mainWindow, options);
    }

    private onAppWindowAllClosed(): void {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') app.quit();
    }

    private onAppActivate(): void {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (this._mainWindow === null) this.createWindow();
    }

    //创建游戏浏览窗口
    private createWindow(): void {
        this._mainWindow = new BrowserWindow({
            width: 1600,
            height: 900,
            webPreferences: {
                preload: `${app.getAppPath()}/dist/renderer-bundle.js`,
                nodeIntegration: true,
                nodeIntegrationInSubFrames: true,
                webSecurity: false
            }
        });

        //初始化MainWindow
        this.initMainWindow();
    }

    /** 初始化MainWindow */
    private async initMainWindow(): Promise<void> {
        // Open the DevTools.
        if (!app.isPackaged) {
            this._mainWindow.webContents.openDevTools();
        }

        this._mainWindow.on('close', this.onClose);
        this._mainWindow.webContents.on('crashed', this.onCrashed);
        await this._mainWindow.loadFile(`${app.getAppPath()}/dist/renderer.html`);
        this.test();

        //设置菜单

        const template = [
            // {
            //   label: '窗口',
            //   role: 'window',
            //   submenu: [
            //     {
            //       label: '重载',
            //       click: (item, focusedWindow) => {
            //         if (focusedWindow) {
            //           // 重载之后, 刷新并关闭所有的次要窗体
            //           if (focusedWindow.id === 1) {
            //             BrowserWindow.getAllWindows().forEach((win) => {
            //               if (win.id > 1) {
            //                 win.close()
            //               }
            //             })
            //           }
            //           focusedWindow.reload()
            //         }
            //       }
            //     },
            //     {
            //       label: '最小化',
            //       role: 'minimize'
            //     },
            //     {
            //       label: '切换全屏',
            //       click: (item, focusedWindow) => {
            //         if (focusedWindow) {
            //           focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            //         }
            //       }
            //     }
            //   ]
            // },
            {
                label: '帮助',
                role: 'help',
                submenu: [
                    {
                        label: '切换开发者工具',
                        accelerator: ((): string => {
                            if (process.platform === 'darwin') {
                                return 'Alt+Command+I';
                            } else {
                                return 'Ctrl+Shift+I';
                            }
                        })(),
                        click: (tItem: unknown, tFocusedWindow: webContents): void => {
                            if (tFocusedWindow) {
                                tFocusedWindow.toggleDevTools();
                            }
                        }
                    },
                    {
                        label: '关于',
                        click: (): void => {
                            shell.openExternal('http://www.bellcode.com');
                        }
                    }
                ]
            }
        ];
        // const menu = Menu.buildFromTemplate(template);
        // Menu.setApplicationMenu(menu);
        if (app.isPackaged) {
            Menu.setApplicationMenu(null);
        }
    }

    /** 程序崩溃 */
    private onCrashed(): void {
        const options = {
            type: 'error',
            title: '进程崩溃了',
            message: '这个进程已经崩溃.',
            buttons: ['重载', '退出'],
        };
        const index = dialog.showMessageBoxSync(this._mainWindow, options);
        if (index != 0) {
            app.quit();
        }
    }

    /** 监听窗口关闭前 */
    private onClose(tEvt: Event): void {
        tEvt.preventDefault();		//阻止默认行为，一定要
        app.exit();
    }

    private async test(): Promise<void> {
        // initialize
        const project = new Project({
            // Optionally specify compiler options, tsconfig.json, in-memory file system, and more here.
            // If you initialize with a tsconfig.json, then it will automatically populate the project
            // with the associated source files.
            // Read more: https://ts-morph.com/setup/
            // useInMemoryFileSystem: true
        });

        const appPath: string = app.getAppPath();

        // add source files
        project.addSourceFilesAtPaths(`${appPath}/dist/**/*.ts`);
        const myClassFile = project.createSourceFile(`${appPath}/dist/MyClass.ts`,
            "export class MyClass {}",
            {
                overwrite: true
            });
        const myEnumFile = project.createSourceFile(`${appPath}/dist/MyEnum.ts`,
            {
                statements: [{
                    kind: StructureKind.Enum,
                    name: "MyEnum",
                    isExported: true,
                    members: [{ name: "member" }],
                }],
            },
            {
                overwrite: true
            });

        // get information
        const myClass = myClassFile.getClassOrThrow("MyClass");
        myClass.getName();          // returns: "MyClass"
        myClass.hasExportKeyword(); // returns: true
        myClass.isDefaultExport();  // returns: false

        // manipulate
        const myInterface = myClassFile.addInterface({
            name: "IMyInterface",
            isExported: true,
            properties: [{
                name: "myProp",
                type: "number",
            }],
        });

        myClass.rename("NewName");
        myClass.addImplements(myInterface.getName());
        myClass.addProperty({
            name: "myProp",
            initializer: "5",
        });

        project.getSourceFileOrThrow(`${appPath}/dist/ExistingFile.ts`).delete();

        // asynchronously save all the changes above
        await project.save();

        // get underlying compiler node from the typescript AST from any node
        const compilerNode = myClassFile.compilerNode;
    }
}

//初始化方法
function init(): void {
    //限制只启用一个程序
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        app.quit();
        return;
    }

    const main = new Main();
    main.init();
}

//初始化
init();