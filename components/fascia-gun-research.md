# 筋膜枪电力款

## 当前方案

当前保留四合一电力款，以及四种升级版专用枪。之前的机械款试作已撤下，后续机械方案重新讨论后再决定实现方式。

四合一款 `marguerite:fascia_gun_universal` 复用现有 `pfFE` 能源字段和 10,000 FE 容量。搓脚时按脚掌、脚跟、脚趾、脚心的顺序，从仍有需求的部位开始处理；当前部位需求清零后，后续拖动请求自动切换到下一个部位。它只支持主手触发，能源不足时中止本次服务，不改扣玩家体力。

每次处理的 FE 消耗取对应部位的 `kubejs:serve.stamina_cost.<part>` 属性值。调试用“一键满足”不适配四合一自动顺序；旧的无头枪和单部位枪逻辑继续保留。

升级版专用枪 ID 为 `marguerite:fascia_gun_<part>_advanced`。每个 200 像素拖动请求最多处理对应部位的两次需求，实际处理次数受剩余需求限制；每个请求只扣一次对应部位 FE。满意度、金钱、步骤与皴掉落按有效服务次数逐次结算，Boss 满意度倍率逐次应用并取整；搓泥宝每个请求扣 1 点耐久。玩家只收到一条累计收益提示、一次成功音效和一次最终状态同步。升级枪仅主手有效，不自动切换部位。

## 相关实现

- `kubejs/startup_scripts/item/fascia_gun.js`：注册四合一电力款、升级版专用枪及其 FE 能力。
- `kubejs/server_scripts/item/fasciaGunHandler.js`：导出枪械匹配、FE 消耗、自动顺序枪和升级枪识别接口。
- `kubejs/server_scripts/pathfinder/pfNetworkHandler.js`：实现需求部位选择、批量服务结算及 FE 不足时中止。
- `kubejs/server_scripts/recipes/recipes_fascia_gun.js`：单部位和四合一枪配方。
- `kubejs/client_scripts/tooltip/fasciaGunTooltip.js`：显示现有电量和升级效果。
- `kubejs/client_scripts/ui/foot_ui.js` 与 `apricity/kubejs/fascia_gun.png`：显示通用枪或对应部位的拖动图标。

## 后续设计边界

后续如要重新设计机械原理的筋膜枪，应先确定驱动方式、玩家交互、供能模型和与 Pathfinder 服务流程的接口，再单独评估实现。
