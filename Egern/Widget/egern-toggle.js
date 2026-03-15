            
/**
 * Egern Toggle Widget
 * 功能：显示当前 Egern 状态（开启/关闭），并提供一个按钮。
 * 点击按钮时：若开启则停止，若关闭则启动。
 */

export default async function (ctx) {
  // 获取当前 IPv4 接口名称
  const interfaceV4 = ctx.device?.ipv4?.interface || "";
  // 检查接口是否包含 "utun"（VPN 开启时的典型特征）
  const isOn = interfaceV4.toLowerCase().includes("utun");

  const statusText = isOn ? "已开启" : "已关闭";
  const statusColor = isOn ? "#34C759" : "#FF3B30"; // 绿色 / 红色
  const icon = isOn ? "sf-symbol:bolt.fill" : "sf-symbol:bolt.slash.fill";
  const actionUrl = isOn ? "egern:/stop" : "egern:/start";
  const btnLabel = isOn ? "停止" : "启动";

  return {
    type: "widget",
    backgroundColor: {
      light: "#FFFFFF",
      dark: "#1C1C1E"
    },
    padding: 16,
    // 点击整个小组件背景也可触发跳转
    url: actionUrl,
    children: [
      {
        type: "stack",
        direction: "row",
        alignItems: "center",
        gap: 8,
        children: [
          {
            type: "image",
            src: icon,
            color: statusColor,
            width: 22,
            height: 22
          },
          {
            type: "text",
            text: "Egern 状态",
            font: { size: "14", weight: "bold" },
            textColor: { light: "#000000", dark: "#FFFFFF" }
          }
        ]
      },
      { type: "spacer" },
      {
        type: "stack",
        direction: "column",
        alignItems: "center",
        gap: 4,
        children: [
          {
            type: "text",
            text: statusText,
            font: { size: "14", weight: "black" },
            textColor: statusColor
          },
          {
            type: "text",
            text: interfaceV4 || "no interface",
            font: { size: "13" },
            textColor: "#8E8E93"
          }
        ]
      },
      { type: "spacer" },
      {
        type: "stack",
        direction: "row",
        backgroundColor: statusColor,
        borderRadius: 12,
        padding: [10, 20],
        alignItems: "center",
        children: [
          {
            type: "text",
            text: btnLabel,
            textColor: "#FFFFFF",
            font: { weight: "bold" }
          }
        ]
      }
    ]
  };
}