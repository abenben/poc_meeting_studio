import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// 議事録の構造を定義
interface ActionPlanItem {
  task: string;
  assignee: string;
  deadline: string;
}

interface StructuredMinutes {
  summary: string;
  decisions: string[];
  action_plan: ActionPlanItem[];
}

const App: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [structuredResult, setStructuredResult] = useState<StructuredMinutes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      setError("文字起こしテキストを入力してください。");
      return;
    }
    // APIキーの存在チェック
    if (!import.meta.env.VITE_API_KEY) {
      setError("APIキーが設定されていません。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStructuredResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY! });

      const prompt = `以下の文字起こしテキストを解析し、指定されたJSON形式で出力してください。

文字起こしテキスト:
"""
${transcript}
"""`;

      const systemInstruction = `あなたは会議の文字起こしを分析し、要点を構造化する専門のアシスタントです。
出力は必ず以下のJSON形式でなければなりません。
{
  "summary": "会議全体の簡潔な要約。",
  "decisions": [
    "会議で決定された事項のリスト。箇条書きで記述してください。"
  ],
  "action_plan": [
    {
      "task": "具体的なタスク内容",
      "assignee": "担当者名",
      "deadline": "YYYY-MM-DD形式の期限"
    }
  ]
}`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      const parsedData: StructuredMinutes = JSON.parse(jsonStr);
      setStructuredResult(parsedData);

    } catch (e: any) {
      console.error(e);
      setError("議事録の生成に失敗しました。時間をおいて再試行してください。");
    } finally {
      setIsLoading(false);
    }
  };

  const convertToMarkdown = (data: StructuredMinutes): string => {
    const parts: string[] = [];
    parts.push('# 議事録');
    parts.push('');

    parts.push('## 会議の要約');
    parts.push(data.summary);
    parts.push('');

    parts.push('## 決定事項');
    if (data.decisions && data.decisions.length > 0) {
      parts.push(...data.decisions.map(decision => `- ${decision}`));
    } else {
      parts.push('特になし');
    }
    parts.push('');

    parts.push('## アクションプラン');
    if (data.action_plan && data.action_plan.length > 0) {
      parts.push('| タスク | 担当者 | 期限 |');
      parts.push('|:---|:---|:---|');
      parts.push(...data.action_plan.map(item => `| ${item.task} | ${item.assignee} | ${item.deadline} |`));
    } else {
      parts.push('特になし');
    }
    parts.push('');

    return parts.join('\n');
  };

  const handleExportMarkdown = () => {
    if (!structuredResult) return;

    const markdownContent = convertToMarkdown(structuredResult);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '議事録.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const renderOutput = () => {
    if (isLoading) {
      return <div className="loader" aria-label="読み込み中"></div>;
    }
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    if (structuredResult) {
      return (
        <>
          <div className="results" aria-live="polite">
            <h3>会議の要約</h3>
            <p>{structuredResult.summary}</p>
            
            <h3>決定事項</h3>
            <ul>
              {structuredResult.decisions.map((decision, index) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>

            <h3>アクションプラン</h3>
            {structuredResult.action_plan && structuredResult.action_plan.length > 0 ? (
              <table className="action-plan-table">
                <thead>
                  <tr>
                    <th>タスク</th>
                    <th>担当者</th>
                    <th>期限</th>
                  </tr>
                </thead>
                <tbody>
                  {structuredResult.action_plan.map((item, index) => (
                    <tr key={index}>
                      <td>{item.task}</td>
                      <td>{item.assignee}</td>
                      <td>{item.deadline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>アクションプランはありません。</p>
            )}
          </div>
          <div className="output-actions">
            <button className="btn" onClick={handleExportMarkdown}>
              Markdownでエクスポート
            </button>
          </div>
        </>
      );
    }
    return <div className="placeholder">左のフォームに文字起こしを入力し、「議事録を生成する」ボタンを押してください。</div>;
  };

  return (
    <>
      <header>
        <h1>AI議事録ジェネレーター</h1>
      </header>
      <div className="container">
        <main>
          <div className="panel input-panel">
            <h2>1. 文字起こしを貼り付け</h2>
            <textarea
              className="textarea"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="ここにGoogle Meetなどから書き出したテキストを入力してください..."
              aria-label="会議の文字起こし入力"
            />
            <button className="btn" onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? '生成中...' : '議事録を生成する'}
            </button>
          </div>
          <div className="panel output-panel" aria-busy={isLoading}>
            <h2>2. 生成された議事録</h2>
            {renderOutput()}
          </div>
        </main>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);