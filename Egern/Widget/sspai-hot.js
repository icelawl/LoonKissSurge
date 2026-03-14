export default async function (ctx) {
  const env = ctx.env || {};

  const DEFAULT_COUNT = 8;
  const MIN_COUNT = 3;
  const MAX_COUNT = 10;
  const DEFAULT_REFRESH_MINUTES = 30;
  const DEFAULT_FEED_URL = "https://sspai.com/feed";

  const count = clampCount(parsePositiveInt(env.COUNT, DEFAULT_COUNT), MIN_COUNT, MAX_COUNT);
  const refreshMinutes = Math.max(1, parsePositiveInt(env.REFRESH_MINUTES, DEFAULT_REFRESH_MINUTES));
  const feedUrl = (env.FEED_URL || DEFAULT_FEED_URL).trim();

  let rssText = "";
  try {
    const resp = await ctx.http.get(feedUrl, { timeout: 10000 });
    rssText = await resp.text();
  } catch (e) {
    return buildErrorWidget(refreshMinutes);
  }

  let items = [];
  try {
    // 先按 COUNT 解析足够多的条目
    items = parseRss(rssText, count);
  } catch (e) {
    items = [];
  }

  if (!items || items.length === 0) {
    return buildErrorWidget(refreshMinutes);
  }

  const family = ctx.widgetFamily || "systemSmall";
  const displayItems = selectItemsForFamily(items, family, count);
  const refreshAfter = new Date(Date.now() + refreshMinutes * 60000).toISOString();

  switch (family) {
    case "accessoryRectangular":
      return buildAccessoryRectangularWidget(displayItems, refreshAfter);
    case "systemSmall":
    case "systemMedium":
    case "systemLarge":
    case "systemExtraLarge":
    default:
      return buildStandardWidget(displayItems, family, refreshAfter);
  }
}

function parsePositiveInt(value, fallback) {
  const n = parseInt(String(value || "").trim(), 10);
  if (Number.isNaN(n) || !Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function clampCount(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function parseRss(xml, maxItems) {
  if (!xml || typeof xml !== "string") return [];

  const items = [];
  const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) && items.length < maxItems) {
    const itemXml = match[0];

    const titleMatch = itemXml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    if (!titleMatch) continue;

    const linkMatch = itemXml.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i);
    const guidMatch = itemXml.match(/<guid\b[^>]*>([\s\S]*?)<\/guid>/i);

    const rawTitle = titleMatch[1];
    const rawLink = linkMatch ? linkMatch[1] : "";
    const rawGuid = guidMatch ? guidMatch[1] : "";

    const title = cleanRssText(rawTitle);
    let link = cleanRssText(rawLink);
    if (!link && rawGuid) {
      link = cleanRssText(rawGuid);
    }

    if (!title) continue;
    if (!link) continue;

    items.push({ title, link });
  }

  return items;
}

function cleanRssText(str) {
  if (!str) return "";
  let s = String(str);

  // 去掉 CDATA 包裹
  s = s.replace(/<!\[CDATA\[/g, "");
  s = s.replace(/]]>/g, "");

  // 处理常见实体
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&amp;/g, "&");

  // 压缩空白
  s = s.replace(/\s+/g, " ");

  return s.trim();
}

function selectItemsForFamily(items, family, count) {
  const total = items.length;
  let max = count;

  if (family === "accessoryRectangular") {
    max = Math.min(count, 3);
  } else if (family === "systemSmall") {
    max = Math.min(count, 4);
  } else if (family === "systemMedium") {
    max = Math.min(count, 8);
  } else if (family === "systemLarge" || family === "systemExtraLarge") {
    max = count;
  } else if (family === "accessoryInline" || family === "accessoryCircular") {
    max = 1;
  }

  max = Math.max(1, Math.min(max, total));
  return items.slice(0, max);
}

function getBaseWidgetProps(refreshAfter) {
  return {
    type: "widget",
    padding: 12,
    gap: 6,
    backgroundColor: {
      light: "#FFFFFF",
      dark: "#111827",
    },
    refreshAfter,
  };
}

function buildStandardWidget(items, family, refreshAfter) {
  const base = getBaseWidgetProps(refreshAfter);

  const titleFontSize = family === "systemSmall" ? "headline" : "title3";
  const itemFontSize = family === "systemSmall" ? "caption1" : "subheadline";

  const listStack = {
    type: "stack",
    direction: "column",
    alignItems: "start",
    gap: 4,
    children: items.map(function (item) {
      return {
        type: "text",
        text: "• " + item.title,
        url: item.link,
        font: {
          size: itemFontSize,
        },
        textColor: {
          light: "#111827",
          dark: "#E5E7EB",
        },
        maxLines: 2,
        minScale: 0.7,
      };
    }),
  };

  const headerStack = {
    type: "stack",
    direction: "row",
    alignItems: "center",
    gap: 4,
    children: [
      {
        type: "text",
        text: "少数派热点",
        font: {
          size: titleFontSize,
          weight: "semibold",
        },
        textColor: {
          light: "#111827",
          dark: "#F9FAFB",
        },
        maxLines: 1,
        minScale: 0.8,
      },
    ],
  };

  const footerStack = buildFooterStack();

  return {
    type: base.type,
    padding: base.padding,
    gap: base.gap,
    backgroundColor: base.backgroundColor,
    refreshAfter: base.refreshAfter,
    children: [headerStack, listStack, { type: "spacer", flex: 1 }, footerStack],
  };
}

function buildAccessoryRectangularWidget(items, refreshAfter) {
  const base = getBaseWidgetProps(refreshAfter);

  const listChildren = items.map(function (item, index) {
    return {
      type: "text",
      text: (index + 1) + ". " + item.title,
      url: item.link,
      font: {
        size: "caption1",
      },
      textColor: {
        light: "#111827",
        dark: "#E5E7EB",
      },
      maxLines: 1,
      minScale: 0.7,
    };
  });

  const header = {
    type: "text",
    text: "少数派热门",
    font: {
      size: "caption1",
      weight: "semibold",
    },
    textColor: {
      light: "#111827",
      dark: "#F9FAFB",
    },
    maxLines: 1,
    minScale: 0.7,
  };

  const footerStack = buildFooterStack("caption2");

  return {
    type: base.type,
    padding: base.padding,
    gap: base.gap,
    backgroundColor: base.backgroundColor,
    refreshAfter: base.refreshAfter,
    children: [header].concat(listChildren, [footerStack]),
  };
}

function buildFooterStack(fontSize) {
  const size = fontSize || "caption2";

  return {
    type: "stack",
    direction: "row",
    alignItems: "center",
    children: [
      { type: "spacer" },
      {
        type: "date",
        date: new Date().toISOString(),
        format: "relative",
        font: {
          size: size,
        },
        textColor: {
          light: "#6B7280",
          dark: "#9CA3AF",
        },
        textAlign: "right",
        maxLines: 1,
        minScale: 0.7,
      },
    ],
  };
}

function buildErrorWidget(refreshMinutes) {
  const refreshAfter = new Date(Date.now() + refreshMinutes * 60000).toISOString();
  return {
    type: "widget",
    padding: 12,
    gap: 6,
    backgroundColor: {
      light: "#FFFFFF",
      dark: "#111827",
    },
    refreshAfter: refreshAfter,
    children: [
      {
        type: "text",
        text: "加载失败",
        font: {
          size: "body",
          weight: "semibold",
        },
        textColor: "#FF3B30",
        maxLines: 1,
        minScale: 0.8,
      },
    ],
  };
}
