# Chrome Extension: Prompt Palette

この拡張は、どのタブでもチームのプロンプトを検索・コピー（任意で貼り付け）できる最小実装です。

## 使い方
1. Chromeで `chrome://extensions/` を開き、右上の「デベロッパーモード」をON。
2. 「パッケージ化されていない拡張機能を読み込む」→ このディレクトリ `extensions/chrome-palette/` を選択。
3. ショートカット設定: `chrome://extensions/shortcuts` を開き、
   - Prompt Palette → `Command+Shift+K` (Mac) / `Ctrl+Shift+K` (Win) を割り当て。
4. SaaSにログインしたタブを一度開いておく（クッキー送信のため）。
5. 任意のタブでショートカットを押してポップアップを開き、検索→Enterでコピー / Shift+Enterでアクティブ要素に貼り付け。

## 設定（任意）
- 既定のベースURLは `http://localhost:3000`。本番環境で使う場合は `chrome.storage.local.set({ saas_base_url: 'https://your-domain' })` をDevToolsコンソールから設定可能です。

## 権限と注意
- `clipboardWrite`, `activeTab`, `scripting` を使用します。貼り付けはサイトのセキュリティ設定により失敗することがあります。
- API呼び出しは `credentials: 'include'`。SaaS側のCookieは`SameSite=Lax`でOK、HTTPS推奨。


