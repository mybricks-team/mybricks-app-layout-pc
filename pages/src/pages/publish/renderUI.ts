import { getComs, shapeUrlByEnv, parseQuery, getRenderWeb } from "@/utils";
import dfs from "@/utils/dfs";
import { runJs } from "@/utils/runJs";

const USE_CUSTOM_HOST = "__USE_CUSTOM_HOST__";
/** template */
const projectJson = "--projectJson--";
const projectId = "--slot-project-id--";
const executeEnv = "--executeEnv--";
const envList = "--envList--";
const i18nLangContent = "--i18nLangContent--";

const getCustomHostFromUrl = () => {
  try {
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);

    // 获取单个参数
    const MYBRICKS_HOST = params.get("MYBRICKS_HOST");
    if (MYBRICKS_HOST) {
      const hostJson = decodeURIComponent(MYBRICKS_HOST)
      window.MYBRICKS_HOST = JSON.parse(hostJson)
    }
  } catch (e) {
    console.error(`getCustomHostFromUrl error`, e)
  }
}
getCustomHostFromUrl()

const isEqual = (param1, param2) => {
  return param1 === param2
}

const refsRef = { current: null };
const root = ({ renderType, locale, runtime, ...props }) => {
  window.addEventListener("popstate", (...args) => {
    // 获取当前路由
    var currentRoute = window.location.pathname;
    const { pageId } = dfs(window["layoutPC__routerParams"], 'route', currentRoute.substring(window['layoutPC__basePathname']?.length)) ?? {}
    // const pageId = window["layoutPC__routerParams"]?.find(
    //   (item: any) => item.route === currentRoute
    // )?.pageId;
    refsRef.current.canvas.open(pageId, null, "redirect");
  });

  const renderUI = getRenderWeb(renderType);
  const domainServicePath = '--domain-service-path--';//replace it

  return renderUI(projectJson, {
    sceneOpenType: "redirect",
    ref(refs) {
      refsRef.current = refs;
    },
    env: {
      runtime,
      silent: true,
      showErrorNotification: false,
      canvasElement: props?.canvasElement || props.container || document.body,
      i18n(title) {
        //多语言
        if (typeof title?.id === 'undefined') return title
        return i18nLangContent[title.id]?.content?.[locale] || JSON.stringify(title)
        //return title;
      },
      get vars() {
        // 环境变量
        return {
          get getExecuteEnv() {
            return () => executeEnv;
          },
          get getQuery() {
            return () => {
              return parseQuery(location.search);
            };
          },
          //antd 语言包地址
          get locale() {
            return locale
          },
          get getProps() {
            // 获取主应用参数方法，如：token等参数，取决于主应用传入
            return () => {
              if (!props) return undefined;
              return props;
            };
          },
          get getCookies() {
            return () => {
              const cookies = document.cookie.split("; ").reduce((s, e) => {
                const p = e.indexOf("=");
                s[e.slice(0, p)] = e.slice(p + 1);
                return s;
              }, {});

              return cookies;
            };
          },
          get getRouter() {
            const isUri = (url) => {
              return /^http[s]?:\/\/([\w\-\.]+)+[\w-]*([\w\-\.\/\?%&=]+)?$/gi.test(
                url
              );
            };
            return () => ({
              reload: () => location.reload(),
              redirect: ({ url }) => location.replace(url),
              back: () => history.back(),
              forward: () => history.forward(),
              pushState: ({ state, title, url }) => {
                if (isUri(url)) {
                  //兼容uri
                  location.href = url;
                } else {
                  history.pushState(state, title, url);
                }
              },
              openTab: ({ url, title }) => open(url, title || "_blank"),
            });
          },
        };
      },
      projectId,
      /** 调用领域模型 */
      callDomainModel(domainModel, type, params) {
        return window.pluginConnectorDomain.call(domainModel, params, {
          action: type,
          before(options) {
            if (['domain', 'aggregation-model'].includes(domainModel.type)) {
              let newOptions = { ...options };
              if (projectId) {
                Object.assign(newOptions.data, {
                  projectId: projectId,
                });
              }
              return {
                ...newOptions,
                url: domainServicePath,
              };
            } else {
              return options;
            }
          },
        });
      },
      callConnector(connector, params, connectorConfig = {}) {
        const plugin =
          window[connector.connectorName] ||
          window["@mybricks/plugins/service"];
        //@ts-ignore
        const MYBRICKS_HOST = window?.MYBRICKS_HOST;
        //@ts-ignore
        if (isEqual(executeEnv, USE_CUSTOM_HOST)) {
          if (typeof MYBRICKS_HOST === "undefined") {
            console.error(`没有设置window.MYBRICKS_HOST变量`);
            return;
          } else if (!MYBRICKS_HOST.default) {
            console.error(`没有设置window.MYBRICKS_HOST.default`);
            return;
          }
        }
        let newParams = params;
        //@ts-ignore
        if (isEqual(executeEnv, USE_CUSTOM_HOST)) {
          if (params instanceof FormData) {
            newParams.append("MYBRICKS_HOST", JSON.stringify(MYBRICKS_HOST));
          } else {
            newParams = { ...params, MYBRICKS_HOST: { ...MYBRICKS_HOST } };
          }
        }
        if (plugin) {
          /** 兼容云组件，云组件会自带 script */
          const curConnector = connector.script
            ? connector
            : (projectJson.plugins[connector.connectorName] || []).find(
              (con) => con.id === connector.id
            );

          return curConnector
            ? plugin.call({ ...connector, ...curConnector }, newParams, {
              ...connectorConfig,
              /** http-sql表示为领域接口 */
              before: connector.type === 'http-sql' ?
                options => {
                  let newOptions = { ...options }
                  if (projectId) {
                    Object.assign(newOptions.data, {
                      projectId: projectId
                    })
                  }
                  return {
                    ...newOptions,
                    url: domainServicePath
                  }
                }
                : (options) => {
                  return {
                    ...options,
                    url: shapeUrlByEnv(
                      envList,
                      executeEnv,
                      options.url,
                      MYBRICKS_HOST
                    ),
                  };
                },
            })
            : Promise.reject("接口不存在，请检查连接器插件中接口配置");
        } else {
          return Promise.reject("错误的连接器类型");
        }
      },
      renderCom(json, opts, coms) {
        return renderUI(json, {
          comDefs: { ...getComs(), ...coms },
          ...(opts || {}),
        });
      },
      get hasPermission() {
        return ({ permission, key }) => {
          if (!projectJson?.hasPermissionFn) {
            return true;
          }

          const code = permission?.register?.code || key;

          let result;

          try {
            result = runJs(decodeURIComponent(projectJson?.hasPermissionFn), [
              { key: code },
            ]);

            if (typeof result !== "boolean") {
              result = true;
              console.warn(
                `权限方法返回值类型应为 Boolean 请检查，[key] ${code}; [返回值] type: ${typeof result}; value: ${JSON.stringify(
                  result
                )}`
              );
            }
          } catch (error) {
            result = true;
            console.error(`权限方法出错 [key] ${code}；`, error);
          }

          return result;
        };
      },
      // uploadFile: uploadApi,
    },
  });
};

export default root;
