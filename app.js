// --- Supabaseの設定 ---
const SB_URL = 'https://wdlakjpidubkiiwhzigq.supabase.co'; 
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbGFranBpZHVia2lpd2h6aWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTU3ODMsImV4cCI6MjA4OTQ5MTc4M30.WxPL0GUR0UEETnwkz-s-z5cEVK_LjdhKhLEpDmnU_Ow';
        // --------------------------------------------------
const client = supabase.createClient(SB_URL, SB_KEY);

// --- メイン処理：ランキングの取得と表示 ---
async function fetchAndRenderRanking() {
    // 1. 最新データの取得
    const { data, error } = await client
        .from('game_entries')
        .select('*')
        // 必要に応じて今月のデータに絞り込む（前回のコード参照）
        // .gte('created_at', firstDayOfMonth) 
        ;

    if (error) {
        console.error('データ取得エラー:', error);
        return;
    }

    // 2. データの集計（名前ごとにWIN数をカウント）
    const stats = data.reduce((acc, cur) => {
        const key = `${cur.nickname.trim()}_${cur.email.trim()}`; // 一意のキー
        if (!acc[key]) {
            acc[key] = { nickname: cur.nickname, count: 0 };
        }
        acc[key].count++;
        return acc;
    }, {});

    // 3. 配列に変換してソート（WIN数が多い順）
    const sortedStats = Object.values(stats)
        .sort((a, b) => b.count - a.count);

    // 4. HTMLへの流し込み
    const listEl = document.getElementById('ranking-list');
    listEl.innerHTML = ''; // 一度クリア

    sortedStats.forEach((entry, index) => {
        const rank = index + 1;
        
        // アイテムのコンテナ作成
        const itemEl = document.createElement('div');
        itemEl.className = 'ranking-item';
        
        // TOP1, 2, 3にはクラスを追加
        if (rank === 1) itemEl.classList.add('rank-1');
        if (rank === 2) itemEl.classList.add('rank-2');
        if (rank === 3) itemEl.classList.add('rank-3');

        // 中身の構築
        itemEl.innerHTML = `
            <span class="rank">#${rank}</span>
            <span class="name">${entry.nickname}</span>
            <span class="win">${entry.count} WIN</span>
        `;
        
        listEl.appendChild(itemEl);
    });
}

// 起動時に実行
fetchAndRenderRanking();

// (オプション) 1分ごとに自動更新
// setInterval(fetchAndRenderRanking, 60000);