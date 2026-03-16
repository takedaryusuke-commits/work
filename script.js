// グローバル変数
let listingChart, priceChart;
let currentFilters = {
    propertyType: "中古マンション",
    radius: 2,
    walkTime: "全て",
    buildingAge: "全て",
    layout: "全て",
    area: "全て"
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    console.log('Chart available:', typeof Chart);
    console.log('mockData available:', typeof mockData);
    
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded!');
        return;
    }
    if (typeof mockData === 'undefined') {
        console.error('data.js not loaded!');
        return;
    }
    
    try {
        initializeCharts();
        initializeHeatmap();
        initializeFilters();
        updateSummary();
        console.log('Initialization complete');
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// チャート初期化
function initializeCharts() {
    // 掲載件数推移チャート
    const listingCtx = document.getElementById('listingCountChart').getContext('2d');
    listingChart = new Chart(listingCtx, {
        type: 'line',
        data: mockData.listingCountTrend,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '件数'
                    }
                }
            }
        }
    });

    // 平均価格推移チャート
    const priceCtx = document.getElementById('priceAverageChart').getContext('2d');
    priceChart = new Chart(priceCtx, {
        type: 'line',
        data: mockData.priceAverageTrend,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '価格（万円）'
                    }
                }
            }
        }
    });
}

// ヒートマップ初期化
function initializeHeatmap() {
    updateReductionHeatmap();
    updateUpdatesHeatmap();
}

// フィルター初期化
function initializeFilters() {
    // フィルター変更イベント
    const filterElements = ['propertyType', 'radius', 'walkTime', 'buildingAge', 'layout', 'area'];
    
    filterElements.forEach(filterId => {
        const element = document.getElementById(filterId);
        element.addEventListener('change', function() {
            currentFilters[filterId] = this.value;
            updateSearchArea();
            applyFilters();
        });
    });

    // ボタンイベント
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    // 軸選択イベント
    document.getElementById('reductionYAxis').addEventListener('change', updateReductionHeatmap);
    document.getElementById('reductionXAxis').addEventListener('change', updateReductionHeatmap);
    document.getElementById('reductionYear').addEventListener('change', updateReductionHeatmap);
    
    document.getElementById('updatesYAxis').addEventListener('change', updateUpdatesHeatmap);
    document.getElementById('updatesXAxis').addEventListener('change', updateUpdatesHeatmap);
    document.getElementById('updatesYear').addEventListener('change', updateUpdatesHeatmap);
    
    // 初期表示更新
    updateSearchArea();
}

// フィルター適用
function applyFilters() {
    showLoading();
    
    setTimeout(() => {
        updateCharts();
        updateReductionHeatmap();
        updateUpdatesHeatmap();
        updateHeaderCount();
        hideLoading();
    }, 500);
}

// 検索エリア情報更新
function updateSearchArea() {
    const radius = currentFilters.radius;
    const areaText = `東京都新宿区西新宿1丁目-1-1半径${radius}km`;
    document.getElementById('searchArea').textContent = areaText;
}

// ヘッダーの対象物件数更新
function updateHeaderCount() {
    const filteredData = filterData(currentFilters);
    const totalCount = filteredData.length;
    document.getElementById('headerTotalCount').textContent = `${totalCount}件`;
}

// フィルターリセット
function resetFilters() {
    currentFilters = {
        propertyType: "中古マンション",
        radius: 2,
        walkTime: "全て",
        buildingAge: "全て",
        layout: "全て",
        area: "全て"
    };
    
    // UI更新
    document.getElementById('propertyType').value = "中古マンション";
    document.getElementById('radius').value = "2";
    document.getElementById('walkTime').value = "全て";
    document.getElementById('buildingAge').value = "全て";
    document.getElementById('layout').value = "全て";
    document.getElementById('area').value = "全て";
    
    updateSearchArea();
    applyFilters();
}

// チャート更新
function updateCharts() {
    const filteredData = filterData(currentFilters);
    
    // 簡易的なデータ更新（実際はフィルタリング結果に基づく）
    const variation = Math.random() * 0.3 + 0.85; // 0.85-1.15の範囲
    
    // 掲載件数データ更新
    const newListingData = mockData.listingCountTrend.datasets[0].data.map(val => 
        Math.round(val * variation)
    );
    listingChart.data.datasets[0].data = newListingData;
    listingChart.update();
    
    // 価格データ更新
    const newPriceData = mockData.priceAverageTrend.datasets[0].data.map(val => 
        Math.round(val * variation)
    );
    priceChart.data.datasets[0].data = newPriceData;
    priceChart.update();
}

// 平均価格更新額ヒートマップ更新
function updateReductionHeatmap() {
    const yAxis = document.getElementById('reductionYAxis').value;
    const xAxis = document.getElementById('reductionXAxis').value;
    const year = document.getElementById('reductionYear').value;
    
    const heatmapData = generateReductionHeatmapData(yAxis, xAxis, year);
    renderHeatmap(heatmapData, 'reductionHeatmapContainer', '');
}

// 平均価格更新回数ヒートマップ更新
function updateUpdatesHeatmap() {
    const yAxis = document.getElementById('updatesYAxis').value;
    const xAxis = document.getElementById('updatesXAxis').value;
    const year = document.getElementById('updatesYear').value;
    
    const heatmapData = generateUpdatesHeatmapData(yAxis, xAxis, year);
    renderHeatmap(heatmapData, 'updatesHeatmapContainer', '');
}

// 平均価格更新額ヒートマップデータ生成
function generateReductionHeatmapData(yAxis, xAxis, year) {
    const axisLabels = {
        price: ["2000万円台", "3000万円台", "4000万円台", "5000万円台", "6000万円台"],
        walkTime: ["0-5分", "6-10分", "11-15分", "16-20分", "21分以上"],
        age: ["築5年以内", "築10年以内", "築15年以内", "築20年以内", "築20年超"],
        area: ["30㎡未満", "30-50㎡", "50-70㎡", "70-90㎡", "90㎡以上"],
        layout: ["1R・1K", "1DK・1LDK", "2DK・2LDK", "3DK・3LDK", "4LDK以上"]
    };
    
    const yLabels = axisLabels[yAxis];
    const xLabels = axisLabels[xAxis];
    
    // 年と軸によるランダムデータ生成（更新額: 0-300万円、小数点1桁）
    const yearMultiplier = (2024 - parseInt(year)) * 0.1 + 0.8;
    const data = yLabels.map(() => 
        xLabels.map(() => (Math.random() * 300 * yearMultiplier).toFixed(1) + '万円')
    );
    
    return { yLabels, xLabels, data };
}

// 平均価格更新回数ヒートマップデータ生成
function generateUpdatesHeatmapData(yAxis, xAxis, year) {
    const axisLabels = {
        price: ["2000万円台", "3000万円台", "4000万円台", "5000万円台", "6000万円台"],
        walkTime: ["0-5分", "6-10分", "11-15分", "16-20分", "21分以上"],
        age: ["築5年以内", "築10年以内", "築15年以内", "築20年以内", "築20年超"],
        area: ["30㎡未満", "30-50㎡", "50-70㎡", "70-90㎡", "90㎡以上"],
        layout: ["1R・1K", "1DK・1LDK", "2DK・2LDK", "3DK・3LDK", "4LDK以上"]
    };
    
    const yLabels = axisLabels[yAxis];
    const xLabels = axisLabels[xAxis];
    
    // 年と軸によるランダムデータ生成（更新回数: 0-5回、小数点1桁）
    const yearMultiplier = (2024 - parseInt(year)) * 0.2 + 0.6;
    const data = yLabels.map(() => 
        xLabels.map(() => (Math.random() * 5 * yearMultiplier).toFixed(1) + '回')
    );
    
    return { yLabels, xLabels, data };
}

// ヒートマップ描画
function renderHeatmap(heatmapData, containerId, unit) {
    const container = document.getElementById(containerId);
    
    let html = '<table class="heatmap-table"><thead><tr><th></th>';
    
    // ヘッダー行
    heatmapData.xLabels.forEach(label => {
        html += `<th>${label}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // 数値のみを抽出して最大値を計算
    const numericData = heatmapData.data.map(row => 
        row.map(val => parseFloat(val))
    );
    const maxValue = Math.max(...numericData.flat());
    
    // データ行
    heatmapData.yLabels.forEach((yLabel, yIndex) => {
        html += `<tr><th>${yLabel}</th>`;
        heatmapData.xLabels.forEach((xLabel, xIndex) => {
            const value = heatmapData.data[yIndex][xIndex];
            const numericValue = parseFloat(value);
            const heatLevel = Math.min(Math.floor((numericValue / maxValue) * 10), 10);
            html += `<td class="heatmap-cell heat-${heatLevel}" title="${yLabel} × ${xLabel}: ${value}">${value}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// サマリー更新
function updateSummary() {
    updateHeaderCount();
}

// ローディング表示/非表示
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.remove('hidden');
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('hidden');
}
