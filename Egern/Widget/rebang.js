            

/**
 * rebang.js
 * Egern Widget Script for rebang.today
 * Optimized for Egern 2.0+ DSL and API
 */

const SITES = {
  "zhihu": { tab: "zhihu", sub_tab: "hot" },
  "weibo": { tab: "weibo", sub_tab: "search" },
  "36kr": { tab: "36kr", sub_tab: "hotlist" },
  "ithome": { tab: "ithome", sub_tab: "today", extra: "&date_type=now" },
  "baidu": { tab: "baidu", sub_tab: "realtime" },
  "xiaohongshu": { tab: "xiaohongshu", sub_tab: "hot-search" },
  "toutiao": { tab: "toutiao", sub_tab: "hot" },
  "douyin": { tab: "douyin", sub_tab: "hot" },
  "sspai": { tab: "sspai", sub_tab: "recommend" },
  "hupu": { tab: "hupu", sub_tab: "all-gambia" },
  "bilibili": { tab: "bilibili", sub_tab: "hot" },
  "top": { tab: "top", sub_tab: "today" }
};

async function fetchRebangData(ctx, siteKey) {
  const config = SITES[siteKey] || { tab: siteKey, sub_tab: "hot" };
  const baseUrl = "https://api.rebang.today/v1/items";
  const url = `${baseUrl}?tab=${config.tab}&sub_tab=${config.sub_tab}&version=1&page=1${config.extra || ""}`;

  const options = {
    headers: {
      "Referer": "https://rebang.today/",
      "Origin": "https://rebang.today",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    }
  };

  try {
    const response = await ctx.http.get(url, options);
    if (response.status !== 200) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const json = await response.json();
    if (json.code !== 200) {
      throw new Error(`API Error: ${json.msg}`);
    }

    let list = json.data.list;
    if (typeof list === 'string') {
      list = JSON.parse(list);
    }

    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.error(`[Rebang] Error: ${error.message}`);
    return [];
  }
}

export default async function (ctx) {
  const siteKey = ctx.env.tab || "zhihu";
  const items = await fetchRebangData(ctx, siteKey);

  // Widget Size adaptation
  let maxDisplay = 2;
  if (ctx.widgetFamily === 'systemMedium') maxDisplay = 4;
  if (ctx.widgetFamily === 'systemLarge' || ctx.widgetFamily === 'systemExtraLarge') maxDisplay = 8;

  if (items.length === 0) {
    return {
      type: "widget",
      children: [{
        type: "text",
        text: `加载 ${siteKey} 失败`,
        font: { size: 14 },
        textColor: "#888888"
      }],
      padding: 16
    };
  }

  const displayItems = items.slice(0, maxDisplay);

  return {
    type: "widget",
    backgroundColor: { light: "#FFFFFF", dark: "#1C1C1E" },
    padding: 12,
    alignItems: "start",
    children: [
      // Header
      {
        type: "stack",
        direction: "row",
        alignItems: "start",
        gap: 8,
        children: [
          {
            type: "text",
            text: siteKey.toUpperCase() + " 热榜",
            font: { size: 15, weight: "bold" },
            textColor: { light: "#000000", dark: "#FFFFFF" }
          }
        ],
        padding: [0, 0, 8, 0]
      },
      // Items
      ...displayItems.map((item, index) => ({
        type: "stack",
        direction: "row",
        alignItems: "start",
        gap: 6,
        url: item.url,
        children: [
          {
            type: "text",
            text: `${index + 1}.`,
            font: { size: 13, weight: index < 3 ? "bold" : "regular" },
            textColor: index < 3 ? "#FF4500" : "#888888",
            width: 18,
            "maxLines": 2,
            "minScale": 0.5
          },
          {
            type: "text",
            text: item.title,
            font: { size: 13 },
            textColor: { light: "#333333", dark: "#DDDDDD" },
            maxLines: 1,
            flex: 1,
            "maxLines": 2,
            "minScale": 0.5
          }
        ],
        padding: [3, 0]
      }))
    ]
  };
}