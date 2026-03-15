            
/**
 * Egern VPN 快速开关小组件
 * 用于在 iOS 主屏幕快速开启/关闭 Egern VPN
 * 
 * 使用方法：
 * 1. 在 Egern 中创建一个新的 generic 类型脚本，粘贴此代码
 * 2. 在小组件画廊中创建小组件并关联此脚本
 * 3. 添加到主屏幕
 */

export default async function(ctx) {
  // 获取当前 VPN 状态（从存储中读取）
  let vpnStatus = await ctx.storage.get('vpn_status') || 'unknown';
  let lastUpdate = await ctx.storage.get('last_update') || '';
  
  // 根据 widget 尺寸渲染不同布局
  const isSmall = ctx.widgetFamily === 'systemSmall';
  const isMedium = ctx.widgetFamily === 'systemMedium';
  const isLarge = ctx.widgetFamily === 'systemLarge';
  
  // 状态颜色
  const statusColors = {
    connected: '#34C759',    // 绿色 - 已连接
    disconnected: '#FF3B30', // 红色 - 已断开
    connecting: '#FF9500',   // 橙色 - 连接中
    unknown: '#8E8E93'       // 灰色 - 未知
  };
  
  const statusTexts = {
    connected: '已连接',
    disconnected: '已断开',
    connecting: '连接中',
    unknown: '未知'
  };
  
  const currentColor = statusColors[vpnStatus] || statusColors.unknown;
  const currentText = statusTexts[vpnStatus] || '未知';
  
  // 小尺寸小组件
  if (isSmall) {
    return {
      type: 'widget',
      backgroundColor: '#1C1C1E',
      padding: 16,
      children: [
        {
          type: 'stack',
          direction: 'vertical',
          alignItems: 'center',
          justifyContent: 'center',
          children: [
            // 状态图标
            {
              type: 'image',
              src: 'sf-symbol:power',
              width: 48,
              height: 48,
              tintColor: currentColor
            },
            {
              type: 'spacer',
              length: 8
            },
            // 状态文本
            {
              type: 'text',
              text: currentText,
              textColor: currentColor,
              font: {
                size: 'headline',
                weight: 'semibold'
              }
            },
            {
              type: 'spacer',
              length: 4
            },
            // 提示文本
            {
              type: 'text',
              text: '点击切换 VPN',
              textColor: '#8E8E93',
              font: {
                size: 'caption2'
              }
            }
          ]
        },
        // 点击区域 - 使用 link 打开 Egern
        {
          type: 'link',
          url: vpnStatus === 'connected' ? 'egern:/stop' : 'egern:/start',
          children: []
        }
      ]
    };
  }
  
  // 中尺寸小组件
  if (isMedium) {
    return {
      type: 'widget',
      backgroundColor: '#1C1C1E',
      padding: 16,
      children: [
        {
          type: 'stack',
          direction: 'horizontal',
          alignItems: 'center',
          justifyContent: 'space-between',
          children: [
            // 左侧：状态信息
            {
              type: 'stack',
              direction: 'vertical',
              alignItems: 'start',
              children: [
                {
                  type: 'text',
                  text: 'Egern VPN',
                  textColor: '#FFFFFF',
                  font: {
                    size: 'headline',
                    weight: 'bold'
                  }
                },
                {
                  type: 'spacer',
                  length: 4
                },
                {
                  type: 'stack',
                  direction: 'horizontal',
                  alignItems: 'center',
                  gap: 6,
                  children: [
                    {
                      type: 'image',
                      src: 'sf-symbol:circle.fill',
                      width: 8,
                      height: 8,
                      tintColor: currentColor
                    },
                    {
                      type: 'text',
                      text: currentText,
                      textColor: currentColor,
                      font: {
                        size: 'subheadline'
                      }
                    }
                  ]
                },
                {
                  type: 'spacer',
                  length: 4
                },
                {
                  type: 'text',
                  text: lastUpdate ? `更新于 ${lastUpdate}` : '点击刷新状态',
                  textColor: '#8E8E93',
                  font: {
                    size: 'caption2'
                  }
                }
              ]
            },
            // 右侧：开关按钮
            {
              type: 'stack',
              direction: 'horizontal',
              gap: 12,
              children: [
                // 开启按钮
                {
                  type: 'link',
                  url: 'egern:/start',
                  children: [
                    {
                      type: 'stack',
                      direction: 'vertical',
                      alignItems: 'center',
                      backgroundColor: vpnStatus === 'connected' ? '#34C75933' : '#34C759',
                      cornerRadius: 12,
                      padding: 12,
                      children: [
                        {
                          type: 'image',
                          src: 'sf-symbol:play.fill',
                          width: 24,
                          height: 24,
                          tintColor: vpnStatus === 'connected' ? '#34C759' : '#FFFFFF'
                        },
                        {
                          type: 'text',
                          text: '开启',
                          textColor: vpnStatus === 'connected' ? '#34C759' : '#FFFFFF',
                          font: { size: 'caption1' }
                        }
                      ]
                    }
                  ]
                },
                // 关闭按钮
                {
                  type: 'link',
                  url: 'egern:/stop',
                  children: [
                    {
                      type: 'stack',
                      direction: 'vertical',
                      alignItems: 'center',
                      backgroundColor: vpnStatus === 'disconnected' ? '#FF3B3033' : '#FF3B30',
                      cornerRadius: 12,
                      padding: 12,
                      children: [
                        {
                          type: 'image',
                          src: 'sf-symbol:stop.fill',
                          width: 24,
                          height: 24,
                          tintColor: vpnStatus === 'disconnected' ? '#FF3B30' : '#FFFFFF'
                        },
                        {
                          type: 'text',
                          text: '关闭',
                          textColor: vpnStatus === 'disconnected' ? '#FF3B30' : '#FFFFFF',
                          font: { size: 'caption1' }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }
  
  // 大尺寸小组件
  if (isLarge) {
    return {
      type: 'widget',
      backgroundColor: '#1C1C1E',
      padding: 20,
      children: [
        // 标题
        {
          type: 'stack',
          direction: 'horizontal',
          alignItems: 'center',
          gap: 10,
          children: [
            {
              type: 'image',
              src: 'sf-symbol:network',
              width: 32,
              height: 32,
              tintColor: '#0A84FF'
            },
            {
              type: 'text',
              text: 'Egern VPN 控制',
              textColor: '#FFFFFF',
              font: {
                size: 'title2',
                weight: 'bold'
              }
            }
          ]
        },
        {
          type: 'spacer',
          length: 20
        },
        // 状态卡片
        {
          type: 'stack',
          direction: 'vertical',
          backgroundColor: '#2C2C2E',
          cornerRadius: 16,
          padding: 16,
          children: [
            {
              type: 'text',
              text: '当前状态',
              textColor: '#8E8E93',
              font: { size: 'subheadline' }
            },
            {
              type: 'spacer',
              length: 8
            },
            {
              type: 'stack',
              direction: 'horizontal',
              alignItems: 'center',
              gap: 8,
              children: [
                {
                  type: 'image',
                  src: 'sf-symbol:circle.fill',
                  width: 12,
                  height: 12,
                  tintColor: currentColor
                },
                {
                  type: 'text',
                  text: currentText,
                  textColor: currentColor,
                  font: {
                    size: 'title3',
                    weight: 'semibold'
                  }
                }
              ]
            }
          ]
        },
        {
          type: 'spacer',
          length: 20
        },
        // 操作按钮
        {
          type: 'stack',
          direction: 'horizontal',
          gap: 16,
          children: [
            // 开启按钮
            {
              type: 'link',
              url: 'egern:/start',
              children: [
                {
                  type: 'stack',
                  direction: 'vertical',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#34C759',
                  cornerRadius: 16,
                  padding: 20,
                  children: [
                    {
                      type: 'image',
                      src: 'sf-symbol:play.fill',
                      width: 32,
                      height: 32,
                      tintColor: '#FFFFFF'
                    },
                    {
                      type: 'spacer',
                      length: 8
                    },
                    {
                      type: 'text',
                      text: '开启 VPN',
                      textColor: '#FFFFFF',
                      font: {
                        size: 'headline',
                        weight: 'semibold'
                      }
                    }
                  ]
                }
              ]
            },
            // 关闭按钮
            {
              type: 'link',
              url: 'egern:/stop',
              children: [
                {
                  type: 'stack',
                  direction: 'vertical',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FF3B30',
                  cornerRadius: 16,
                  padding: 20,
                  children: [
                    {
                      type: 'image',
                      src: 'sf-symbol:stop.fill',
                      width: 32,
                      height: 32,
                      tintColor: '#FFFFFF'
                    },
                    {
                      type: 'spacer',
                      length: 8
                    },
                    {
                      type: 'text',
                      text: '关闭 VPN',
                      textColor: '#FFFFFF',
                      font: {
                        size: 'headline',
                        weight: 'semibold'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'spacer',
          length: 16
        },
        // 底部信息
        {
          type: 'text',
          text: lastUpdate ? `最后更新: ${lastUpdate}` : '点击按钮控制 VPN',
          textColor: '#8E8E93',
          font: { size: 'caption1' }
        }
      ]
    };
  }
  
  // 默认返回小尺寸
  return {
    type: 'widget',
    backgroundColor: '#1C1C1E',
    padding: 16,
    children: [
      {
        type: 'text',
        text: 'Egern VPN',
        textColor: '#FFFFFF',
        font: { size: 'headline' }
      }
    ]
  };
}