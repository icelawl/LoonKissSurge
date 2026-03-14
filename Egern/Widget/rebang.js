/**
 * Rebang.Today Widget for Egern
 * Author: Aime
 * Date: 2026-03-15
 * 
 * Deeply tested and fixed version.
 * Supports: zhihu, xiaohongshu, 36kr, weibo, sspai, bilibili, github, toutiao, baidu.
 */

export default async function (ctx) {
  const tab = ctx.env.tab || 'zhihu';
  
  // Site Configuration Map
  // Derived from deep analysis of rebang.today API and menu_tabs
  const siteConfigs = {
    'zhihu': { name: '知乎', tab: 'zhihu', sub_tab: '', version: 1 },
    'xiaohongshu': { name: '小红书', tab: 'xiaohongshu', sub_tab: 'hot-search', version: 1 },
    '36kr': { name: '36氪', tab: '36kr', sub_tab: 'hotlist', version: 1 },
    'weibo': { name: '微博', tab: 'weibo', sub_tab: 'search', version: 1 },
    'sspai': { name: '少数派', tab: 'sspai', sub_tab: 'recommend', version: 1 },
    'bilibili': { name: '哔哩哔哩', tab: 'bilibili', sub_tab: 'popular', version: 1 },
    'github': { name: 'GitHub', tab: 'github', sub_tab: 'all', version: 1 },
    'toutiao': { name: '今日头条', tab: 'toutiao', sub_tab: '', version: 1 },
    'baidu': { name: '百度', tab: 'baidu', sub_tab: 'realtime', version: 1 },
    'top': { name: '全站', tab: 'top', sub_tab: 'today', version: 1 },
    'ithome': { name: 'IT之家', tab: 'ithome', sub_tab: 'today', version: 1 },
  };

  const config = siteConfigs[tab] || { name: tab.toUpperCase(), tab: tab, sub_tab: '', version: 1 };
  const displayName = config.name;
  
  const limitMap = {
    systemSmall: 4,
    systemMedium: 6,
    systemLarge: 12,
    accessoryRectangular: 2,
    accessoryInline: 1
  };
  const limit = limitMap[ctx.widgetFamily] || 6;

  try {
    // Construct URL with correct parameters
    let url = `https://api.rebang.today/v1/items?tab=${config.tab}&page=1&version=${config.version}`;
    if (config.sub_tab) {
      url += `&sub_tab=${config.sub_tab}`;
    }

    const resp = await ctx.http.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Referer': 'https://rebang.today/',
        'Origin': 'https://rebang.today',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    
    if (!resp.ok) {
      throw new Error(`HTTP Error ${resp.status}`);
    }

    const data = await resp.json();
    
    // Check for API level errors (e.g. 1001)
    if (data.code !== 200) {
      const errorMsg = data.msg || 'Unknown API Error';
      throw new Error(`API ${data.code}: ${errorMsg}`);
    }

    if (!data.data || (data.data.list === undefined)) {
      throw new Error('No data field in response');
    }

    // Handle data.data.list (JSON string or Array)
    let rawItems = data.data.list;
    let items = [];
    if (typeof rawItems === 'string') {
      try {
        items = JSON.parse(rawItems);
      } catch (e) {
        throw new Error('Failed to parse list string');
      }
    } else if (Array.isArray(rawItems)) {
      items = rawItems;
    }

    const children = [];

    // Header Stack
    children.push({
      type: 'stack',
      direction: 'row',
      alignItems: 'start',
      children: [
        {
          type: 'text',
          text: `🔥 ${displayName}`,
          font: { size: 15, weight: 'bold' },
          textColor: { light: '#007AFF', dark: '#0A84FF' }
        },
        { type: 'spacer' },
        {
          type: 'text',
          text: '今日热榜',
          font: { size: 10 },
          textColor: '#8e8e93',
          opacity: 0.6
        }
      ]
    });

    children.push({ type: 'spacer', length: 10 });

    // Items List
    const displayItems = items.slice(0, limit);
    if (displayItems.length > 0) {
      displayItems.forEach((item, index) => {
        // Use www_url as primary link, fallback to link
        const itemUrl = item.www_url || item.link || 'https://rebang.today';
        
        children.push({
          type: 'stack',
          direction: 'row',
          alignItems: 'start',
          url: itemUrl,
          children: [
            {
              type: 'text',
              text: `${index + 1}.`,
              font: { size: 13, weight: 'medium' },
              textColor: '#8e8e93',
              width: 20
            },
            {
              type: 'text',
              text: item.title || '无标题',
              font: { size: 13 },
              maxLines: 1,
              flex: 1,
              textColor: { light: '#1C1C1E', dark: '#F2F2F7' }
            },
            {
              type: 'text',
              text: item.heat_str ? ` ${item.heat_str.replace('热度', '')}` : '',
              font: { size: 10 },
              textColor: '#FF9500',
              opacity: 0.9
            }
          ]
        });
        
        if (index < displayItems.length - 1) {
          children.push({ type: 'spacer', length: 7 });
        }
      });
    } else {
      children.push({
        type: 'text',
        text: '暂无榜单数据',
        textAlign: 'center',
        font: { size: 12 },
        textColor: '#8e8e93',
        padding: { top: 20 }
      });
    }

    return {
      type: 'widget',
      backgroundColor: { light: '#FFFFFF', dark: '#1C1C1E' },
      padding: 14,
      refreshAfter: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      children: children
    };

  } catch (e) {
    console.log(`[Rebang Error] ${e.message}`);
    return {
      type: 'widget',
      backgroundColor: { light: '#FFF2F2', dark: '#2C1010' },
      padding: 16,
      children: [
        {
          type: 'text',
          text: '⚠️ 加载失败',
          font: { weight: 'bold', size: 16 },
          textColor: '#FF3B30'
        },
        { type: 'spacer', length: 8 },
        {
          type: 'text',
          text: `Tab: ${tab}\nError: ${e.message}`,
          font: { size: 12 },
          textColor: '#8E8E93',
          maxLines: 4
        },
        { type: 'spacer' },
        {
          type: 'text',
          text: '请检查网络连接或 Tab 设置',
          font: { size: 10 },
          textColor: '#AEAEB2',
          textAlign: 'center'
        }
      ]
    };
  }
}