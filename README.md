# 停車場進出預約與實時剩餘車位 Web App

一個使用純 HTML + Tailwind CSS + JavaScript 製作的停車場預約系統。適合直接放到 GitHub 並用 GitHub Pages 部署。

## 功能

- **實時剩餘車位**：根據目前時間自動計算當前佔用的車位數，每 5 秒更新一次。
- **進出預約**：輸入車牌、進入時間、離開時間進行預約。
- **容量檢查**：新增預約時會簡單檢查該時段是否可能超額。
- **預約管理**：顯示所有預約狀態（即將到來 / 進行中 / 已結束），可取消預約。
- **本地儲存**：使用 `localStorage`，刷新頁面資料不會消失。

## 如何使用（本地）

1. 直接用瀏覽器打開 `index.html`。
2. 在表單中填寫車牌號碼、進入時間與離開時間，點擊「確認預約」。
3. 查看上方實時統計與下方預約列表。
4. 如需取消預約，點擊對應列的「取消」按鈕。

## 部署到 GitHub Pages

1. 在 GitHub 建立一個新 repository（例如 `parking-reservation`）。
2. 將本專案的所有檔案上傳：
   - `index.html`
   - `app.js`
   - `README.md`
   - `.gitignore`
3. 進入 repository 的 **Settings → Pages**。
4. Source 選擇 `Deploy from a branch`，Branch 選 `main`，Folder 選 `/ (root)`。
5. 儲存後等待幾分鐘，即可透過 `https://你的用戶名.github.io/repository名稱/` 訪問。

## 技術說明

- 總車位固定為 **50** 個（可在 `app.js` 中修改 `TOTAL_SPOTS`）。
- 數據僅儲存在瀏覽器本地，適合示範或內部使用。
- 如需多人即時同步，可後續接入後端（例如 Node.js + Socket.io、Firebase 或 Supabase）。

## 檔案結構
