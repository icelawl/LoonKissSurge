/**
 * Rebang.Today Widget for Egern
 * Author: Aime
 * Date: 2026-03-14
 * 
 * Arguments:
 * - tab: The platform key (e.g., zhihu, weibo, xiaohongshu, 36kr, sspai, bilibili, github)
 */

export default async function (ctx) {
  const tab = ctx.env.tab || 'zhihu';
  const tabNames = {
    'top': '全站',
    'zhihu': '知乎',
    'weibo': '微博',
    'xiaohongshu': '小红书',
    '36kr': '36氪',
    'sspai': '少数派',
    'bilibili': '哔哩哔哩',
    'ithome': 'IT之家',
    'hupu': '虎扑',
    'douban-community': '豆瓣',
    'huxiu': '虎嗅',
    'thepaper': '澎湃',
    'toutiao': '头条',
    'ifanr': '爱范儿',
    'baidu': '百度',
    'github': 'GitHub',
    'juejin': '掘金',
    'v2ex': 'V2EX'
  };

  const displayName = tabNames[tab] || tab.toUpperCase();
  
  // Define limit based on widget size
  const limitMap = {
    systemSmall: 3,
    systemMedium: 6,
    systemLarge: 12,
    accessoryRectangular: 2,
    accessoryInline: 1
  };
  const limit = limitMap[ctx.widgetFamily] || 5;

  try {
    const url = `https://api.rebang.today/v1/items?tab=${tab}&date_type=now&version=1`;
    const resp = await ctx.http.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      }
    });
    
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const data = await resp.json();
    if (data.code !== 200 || !data.data || !data.data.list) {
      throw new Error('Invalid API response');
    }

    // data.data.list is a JSON string
    const items = JSON.parse(data.data.list);

    // Build DSL
    const children = [];

    // Header
    children.push({
      type: 'stack',
      direction: 'row',
      alignItems: 'center',
      children: [
        {
          type: 'text',
          text: `🔥 ${displayName}热榜`,
          font: { size: 'subheadline', weight: 'bold' },
          textColor: { light: '#000000', dark: '#ffffff' }
        },
        { type: 'spacer' },
        {
          type: 'text',
          text: 'rebang.today',
          font: { size: 10 },
          textColor: '#8e8e93'
        }
      ]
    });

    children.push({ type: 'spacer', length: 8 });

    // Items
    items.slice(0, limit).forEach((item, index) => {
      children.push({
        type: 'stack',
        direction: 'row',
        url: item.www_url,
        children: [
          {
            type: 'text',
            text: `${index + 1}. ${item.title}`,
            font: { size: 14 },
            maxLines: 1,
            flex: 1,
            textColor: { light: '#333333', dark: '#dddddd' }
          },
          {
            type: 'text',
            text: item.heat_str ? ` ${item.heat_str}` : '',
            font: { size: 10 },
            textColor: '#ff9500',
            opacity: 0.8
          }
        ]
      });
      
      if (index < items.slice(0, limit).length - 1) {
        children.push({ type: 'spacer', length: 6 });
      }
    });

    // Handle empty state
    if (items.length === 0) {
      children.push({
        type: 'text',
        text: '暂无热榜数据',
        textAlign: 'center',
        font: { size: 'caption1' }
      });
    }

    return {
      type: 'widget',
      backgroundColor: { light: '#ffffff', dark: '#1c1c1e' },
      padding: 12,
      refreshAfter: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // Refresh every 10 mins
      children: children
    };

  } catch (e) {
    return {
      type: 'widget',
      padding: 16,
      children: [
        {
          type: 'text',
          text: '⚠️ 加载失败',
          font: { weight: 'bold' },
          textColor: '#ff3b30'
        },
        {
          type: 'text',
          text: e.message,
          font: { size: 'caption2' },
          textColor: '#8e8e93'
        }
      ]
    };
  }
}