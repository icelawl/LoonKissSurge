            
/**
 * Egern Widget for rebang.today
 * 
 * Documentation: https://doc.egernapp.com/zh-CN/docs/configuration/widgets
 */

export default async function (ctx) {
  const tab = ctx.env.TAB || 'top';
  const subTab = ctx.env.SUB_TAB || 'lasthour';
  const apiUrl = `https://api.rebang.today/v1/items?tab=${tab}&sub_tab=${subTab}&version=1&page=1`;

  try {
    const resp = await ctx.http.get(apiUrl, {
      headers: {
        'Referer': 'https://rebang.today/',
        'Accept': 'application/json'
      }
    });

    if (resp.status !== 200) {
      throw new Error(`HTTP Error ${resp.status}`);
    }

    const json = await resp.json();
    if (json.code !== 200 || !json.data || !json.data.list) {
      throw new Error('Invalid API response');
    }

    // List is a JSON string, need to parse it
    const list = JSON.parse(json.data.list);
    
    // Determine number of items based on widget size
    let limit = 3;
    if (ctx.widgetFamily === 'systemMedium') limit = 5;
    if (ctx.widgetFamily === 'systemLarge' || ctx.widgetFamily === 'systemExtraLarge') limit = 10;

    const displayItems = list.slice(0, limit);

    return {
      type: 'widget',
      backgroundColor: {
        light: '#FFFFFF',
        dark: '#1C1C1E'
      },
      padding: 12,
      gap: 8,
      children: [
        // Header
        {
          type: 'stack',
          direction: 'row',
          alignItems: 'center',
          gap: 6,
          children: [
            {
              type: 'image',
              src: 'sf-symbol:flame.fill',
              color: '#FF9500',
              width: 14,
              height: 14
            },
            {
              type: 'text',
              text: '今日热榜',
              font: { size: 'footnote', weight: 'bold' },
              textColor: { light: '#000000', dark: '#FFFFFF' }
            },
            { type: 'spacer' },
            {
              type: 'date',
              date: new Date().toISOString(),
              format: 'time',
              font: { size: 10 },
              textColor: '#8E8E93'
            }
          ]
        },
        // Divider
        {
          type: 'stack',
          height: 0.5,
          backgroundColor: '#38383A',
          opacity: 0.3,
          children: []
        },
        // Items
        ...displayItems.map((item, index) => ({
          type: 'stack',
          direction: 'row',
          alignItems: 'start',
          gap: 8,
          url: item.mobile_url || item.www_url,
          children: [
            {
              type: 'text',
              text: `${index + 1}`,
              font: { size: 'footnote', weight: 'bold' },
              textColor: index < 3 ? '#FF453A' : '#8E8E93',
              width: 16
            },
            {
              type: 'stack',
              direction: 'column',
              flex: 1,
              gap: 2,
              children: [
                {
                  type: 'text',
                  text: item.title,
                  font: { size: 'footnote' },
                  textColor: { light: '#1C1C1E', dark: '#E5E5EA' },
                  maxLines: 2
                },
                {
                  type: 'stack',
                  direction: 'row',
                  alignItems: 'center',
                  gap: 4,
                  children: [
                    {
                      type: 'text',
                      text: item.tab_key.toUpperCase(),
                      font: { size: 9 },
                      textColor: '#007AFF',
                      padding: [1, 3],
                      borderRadius: 2,
                      borderWidth: 0.5,
                      borderColor: '#007AFF'
                    },
                    {
                      type: 'text',
                      text: `${item.heat_num}热度`,
                      font: { size: 9 },
                      textColor: '#8E8E93'
                    }
                  ]
                }
              ]
            }
          ]
        }))
      ]
    };
  } catch (err) {
    return {
      type: 'widget',
      backgroundColor: '#1C1C1E',
      padding: 16,
      children: [
        {
          type: 'text',
          text: '加载失败',
          font: { weight: 'bold' },
          textColor: '#FF453A'
        },
        {
          type: 'text',
          text: err.message,
          font: { size: 'caption1' },
          textColor: '#8E8E93'
        }
      ]
    };
  }
}