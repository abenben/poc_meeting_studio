# 5.システムの概要・実行手順

AI議事録ジェネレーター (AI Meeting Minutes Generator)

会議の文字起こしテキストをAIが解析し、「要約」「決定事項」「アクションプラン」を自動で構造化するアプリケーションです。生成された議事録はMarkdown形式でエクスポートできます。

## 概要

このプロジェクトは、ReactとGoogle Gemini APIを使用して構築されています。ローカル環境で実行するには、モダンなフロントエンド開発ツールである`Vite`を使用します。

## 必要なもの

- [Node.js](https://nodejs.org/) (バージョン 18.x 以上を推奨)
- npm (Node.jsに同梱されています)
- [Google Gemini APIキー](https://ai.google.dev/pricing)

## ローカル環境での実行手順

### 1. プロジェクトのセットアップ

まず、このプロジェクトの全ファイル（`index.html`, `index.tsx`など）をコンピュータ上の新しいディレクトリに保存します。

次に、お使いのターミナル（またはコマンドプロンプト、PowerShell）を開き、ファイルを保存したディレクトリに移動してください。

```sh
# 例: "ai-minutes-app" というディレクトリに移動する場合
cd path/to/ai-minutes-app
```

### 2. 依存関係のインストール

このプロジェクトは `Vite` を使って実行します。`package.json`が提供されているため、以下のコマンドを実行するだけで必要なパッケージがすべてインストールされます。

```bash
npm install
```

### 3. APIキーの設定

プロジェクトのルートディレクトリ（`package.json`と同じ階層）に `.env` という名前の新しいファイルを作成します。このファイルに、あなたのGoogle Gemini APIキーを以下のように記述してください。

**.env ファイル**

```
VITE_API_KEY="ここにあなたのAPIキーを貼り付け"
```

**重要:** 変数名は `VITE_` で始まる必要があります。これにより、Viteが開発サーバーでAPIキーを安全にコード内で利用できるようになります。この `.env` ファイルは `.gitignore` によってGitリポジトリには含まれないように設定されているため、キーが外部に漏れる心配はありません。

### 4. 開発サーバーの起動

準備が整いました。以下のコマンドで開発サーバーを起動します。

```bash
npm run dev
```

ターミナルに `http://localhost:5173` のようなローカルアドレスが表示されます。このアドレスをブラウザで開くと、アプリケーションが表示されます。ファイルの変更は自動的に検知され、ブラウザに反映されます。

## 使い方

1.  **文字起こしの貼り付け:** 画面左側のテキストエリアに、Google Meetなどから書き起こした会議のテキストを貼り付けます。
2.  **議事録の生成:** 「議事録を生成する」ボタンをクリックします。AIがテキストを解析し、結果が右側に表示されるまで少し待ちます。
3.  **結果の確認とエクスポート:** 生成された「要約」「決定事項」「アクションプラン」を確認します。問題がなければ、「Markdownでエクスポート」ボタンをクリックすると、`議事録.md`という名前のファイルがダウンロードされます。
