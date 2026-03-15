/**
 * Egern Toggle Widget (Modern UI)
 * 
 * 功能：显示当前 Egern 状态（开启/关闭），并提供精致的切换控制。
 * 布局：顶部状态栏 + 中部详情 + 底部操作按钮。
 */

export default async function (ctx) {
  // 获取当前网络接口，判断 VPN 状态
  const interfaceV4 = ctx.device?.ipv4?.interface || "";
  const isOn = interfaceV4.toLowerCase().includes("utun");

  // 状态属性定义
  const statusText = isOn ? "VPN 正在运行" : "VPN 已停止";
  const statusColor = isOn ? "#34C759" : "#FF3B30"; // 绿 / 红 (Apple System Colors)
  const actionUrl = isOn ? "egern:/stop" : "egern:/start";
  const btnLabel = isOn ? "停止" : "启动";
  const iconName = "sf-symbol:power";

  // 背景色适配
  const bgColor = {
    light: "#F2F2F7", // System Gray 6
    dark: "#1C1C1E"   // System Gray 6 (Dark)
  };

  const cardBg = {
    light: "#FFFFFF",
    dark: "#2C2C2E"
  };

  return {
    type: "widget",
    backgroundColor: bgColor,
    padding: 12,
    url: actionUrl, // 点击整个组件均可触发操作
    children: [
      {
        type: "stack",
        direction: "column",
        backgroundColor: cardBg,
        borderRadius: 14,
        padding: 12,
        flex: 1,
        gap: 8,
        children: [
          // 顶部：图标 + 标题
          {
            type: "stack",
            direction: "row",
            alignItems: "center",
            gap: 6,
            children: [
              {
                type: "image",
                src: iconName,
                color: statusColor,
                width: 18,
                height: 18
              },
              {
                type: "text",
                text: "Egern",
                font: { size: "headline", weight: "bold" },
                textColor: { light: "#000000", dark: "#FFFFFF" }
              },
              { type: "spacer" },
              {
                type: "stack",
                backgroundColor: `${statusColor}22`, // 浅色背景
                borderRadius: 6,
                padding: [2, 6],
                children: [
                  {
                    type: "text",
                    text: isOn ? "ON" : "OFF",
                    font: { size: "caption2", weight: "black" },
                    textColor: statusColor
                  }
                ]
              }
            ]
          },

          // 中部：状态描述
          {
            type: "stack",
            direction: "column",
            gap: 2,
            children: [
              {
                type: "text",
                text: statusText,
                font: { size: "title3", weight: "bold" },
                textColor: { light: "#1C1C1E", dark: "#F2F2F7" }
              },
              {
                type: "text",
                text: interfaceV4 || "未连接网络",
                font: { size: "caption1" },
                textColor: "#8E8E93",
                maxLines: 1,
                minScale: 0.8
              }
            ]
          },

          { type: "spacer" },

          // 底部：操作按钮
          {
            type: "stack",
            direction: "row",
            backgroundColor: statusColor,
            borderRadius: 10,
            height: 36,
            alignItems: "center",
            url: actionUrl,
            children: [
              { type: "spacer" },
              {
                type: "text",
                text: btnLabel,
                textColor: "#FFFFFF",
                font: { size: "subheadline", weight: "bold" }
              },
              { type: "spacer" }
            ]
          }
        ]
      }
    ]
  };
}