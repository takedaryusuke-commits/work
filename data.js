// モックデータセット
const mockData = {
  // 推移グラフ用データ（5年分）
  listingCountTrend: {
    labels: ["2019年", "2020年", "2021年", "2022年", "2023年"],
    datasets: [{
      label: "掲載件数",
      data: [120, 135, 98, 156, 142],
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      tension: 0.4
    }]
  },

  priceAverageTrend: {
    labels: ["2019年", "2020年", "2021年", "2022年", "2023年"],
    datasets: [{
      label: "平均価格（万円）",
      data: [3200, 3350, 3180, 3480, 3620],
      borderColor: '#e74c3c',
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      tension: 0.4
    }]
  },

  // ヒートマップ用データ（価格帯×徒歩分数）
  heatmapData: {
    yLabels: ["2000万円台", "3000万円台", "4000万円台", "5000万円台", "6000万円台"],
    xLabels: ["0-5分", "6-10分", "11-15分", "16-20分", "21分以上"],
    data: [
      [12, 8, 15, 6, 3],   // 2000万円台
      [18, 25, 22, 12, 8], // 3000万円台
      [8, 15, 18, 14, 5],  // 4000万円台
      [3, 8, 12, 9, 4],    // 5000万円台
      [1, 3, 5, 6, 2]      // 6000万円台
    ]
  },

  // 物件詳細データ（フィルタリング用）
  properties: [
    {id: 1, price: 2800, walkTime: 3, buildingAge: 8, layout: "2LDK", area: 58, propertyType: "中古マンション", priceUpdates: 1, priceReduction: 50},
    {id: 2, price: 3200, walkTime: 7, buildingAge: 12, layout: "3LDK", area: 72, propertyType: "中古マンション", priceUpdates: 2, priceReduction: 150},
    {id: 3, price: 4100, walkTime: 5, buildingAge: 5, layout: "2LDK", area: 65, propertyType: "中古マンション", priceUpdates: 0, priceReduction: 0},
    {id: 4, price: 2600, walkTime: 12, buildingAge: 18, layout: "1LDK", area: 45, propertyType: "中古マンション", priceUpdates: 3, priceReduction: 200},
    {id: 5, price: 5200, walkTime: 2, buildingAge: 3, layout: "3LDK", area: 85, propertyType: "中古マンション", priceUpdates: 1, priceReduction: 100},
    {id: 6, price: 3800, walkTime: 9, buildingAge: 15, layout: "2LDK", area: 68, propertyType: "中古マンション", priceUpdates: 2, priceReduction: 180},
    {id: 7, price: 2900, walkTime: 15, buildingAge: 22, layout: "1DK", area: 38, propertyType: "中古マンション", priceUpdates: 1, priceReduction: 80},
    {id: 8, price: 4500, walkTime: 4, buildingAge: 7, layout: "3LDK", area: 78, propertyType: "中古マンション", priceUpdates: 0, priceReduction: 0},
    {id: 9, price: 3100, walkTime: 11, buildingAge: 14, layout: "2LDK", area: 62, propertyType: "中古マンション", priceUpdates: 2, priceReduction: 120},
    {id: 10, price: 5800, walkTime: 6, buildingAge: 2, layout: "4LDK", area: 95, propertyType: "中古マンション", priceUpdates: 1, priceReduction: 200}
  ],

  // フィルター設定
  filterOptions: {
    propertyType: {
      default: "中古マンション",
      options: ["中古マンション", "新築戸建", "中古戸建", "土地"]
    },
    radius: {
      default: 2,
      options: [0.5, 1, 2, 3, 5]
    },
    walkTime: {
      default: "全て",
      options: ["全て", "0-5分", "6-10分", "11-15分", "16-20分", "21分以上"]
    },
    buildingAge: {
      default: "全て", 
      options: ["全て", "築5年以内", "築10年以内", "築15年以内", "築20年以内", "築20年超"]
    },
    layout: {
      default: "全て",
      options: ["全て", "1R・1K", "1DK・1LDK", "2DK・2LDK", "3DK・3LDK", "4LDK以上"]
    },
    area: {
      default: "全て",
      options: ["全て", "30㎡未満", "30-50㎡", "50-70㎡", "70-90㎡", "90㎡以上"]
    }
  }
};

// データフィルタリング関数
function filterData(filters) {
  return mockData.properties.filter(property => {
    // 物件種別フィルター
    if (filters.propertyType !== "全て" && property.propertyType !== filters.propertyType) {
      return false;
    }
    
    // 駅徒歩フィルター
    if (filters.walkTime !== "全て") {
      const walkRange = getWalkTimeRange(filters.walkTime);
      if (!isInRange(property.walkTime, walkRange)) return false;
    }
    
    // 築年数フィルター
    if (filters.buildingAge !== "全て") {
      const ageRange = getBuildingAgeRange(filters.buildingAge);
      if (!isInRange(property.buildingAge, ageRange)) return false;
    }
    
    // 間取りフィルター
    if (filters.layout !== "全て") {
      if (!matchesLayout(property.layout, filters.layout)) return false;
    }
    
    // 広さフィルター
    if (filters.area !== "全て") {
      const areaRange = getAreaRange(filters.area);
      if (!isInRange(property.area, areaRange)) return false;
    }
    
    return true;
  });
}

// ヘルパー関数
function getWalkTimeRange(walkTimeFilter) {
  const ranges = {
    "0-5分": [0, 5],
    "6-10分": [6, 10],
    "11-15分": [11, 15],
    "16-20分": [16, 20],
    "21分以上": [21, 999]
  };
  return ranges[walkTimeFilter] || [0, 999];
}

function getBuildingAgeRange(ageFilter) {
  const ranges = {
    "築5年以内": [0, 5],
    "築10年以内": [0, 10],
    "築15年以内": [0, 15],
    "築20年以内": [0, 20],
    "築20年超": [21, 999]
  };
  return ranges[ageFilter] || [0, 999];
}

function getAreaRange(areaFilter) {
  const ranges = {
    "30㎡未満": [0, 29],
    "30-50㎡": [30, 50],
    "50-70㎡": [51, 70],
    "70-90㎡": [71, 90],
    "90㎡以上": [91, 999]
  };
  return ranges[areaFilter] || [0, 999];
}

function isInRange(value, range) {
  return value >= range[0] && value <= range[1];
}

function matchesLayout(propertyLayout, filterLayout) {
  const layoutGroups = {
    "1R・1K": ["1R", "1K"],
    "1DK・1LDK": ["1DK", "1LDK"],
    "2DK・2LDK": ["2DK", "2LDK"],
    "3DK・3LDK": ["3DK", "3LDK"],
    "4LDK以上": ["4LDK", "5LDK"]
  };
  
  const group = layoutGroups[filterLayout];
  return group ? group.includes(propertyLayout) : true;
}