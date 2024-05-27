import { APPType } from "../types";
import { Logger } from "@mybricks/rocker-commons";
import * as fs from "fs";
import * as path from 'path';

export const getAppTypeFromTemplate = (template: string) => {
  let app_type = APPType.React;
  try {
    const APP_TYPE_COMMIT = Array.from(template.match(/<!--(.*?)-->/g)).find(
      (matcher) => matcher.includes("_APP_TYPE_")
    );
    if (APP_TYPE_COMMIT.includes(APPType.Vue2)) {
      app_type = APPType.Vue2;
    }
    if (APP_TYPE_COMMIT.includes(APPType.React)) {
      app_type = APPType.React;
    }
  } catch (error) {
    Logger.error("template need appType");
  }
  return app_type;
};

// 同步的递归删除文件夹函数
export function rmdirSync(dir) {
  if (fs.existsSync(dir)) { // 检查目录是否存在
    fs.readdirSync(dir).forEach((file) => { // 读取目录内容
      const curPath = path.join(dir, file); // 获取当前文件或文件夹的路径
      if (fs.lstatSync(curPath).isDirectory()) { // 如果是目录，则递归删除
        rmdirSync(curPath);
      } else { // 如果是文件，则删除文件
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir); // 删除空目录
  }
}