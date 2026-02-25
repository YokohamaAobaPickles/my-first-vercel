/**
 * src/V1/types/common.ts
 * 全機能共通の基盤型定義
 */

/**
 * APIレスポンスの統一フォーマット
 * T は成功時に返却するデータの型。データ不要な場合は ApiResponse とだけ書けば void になる。
 */
export interface ApiResponse<T = void> {
  success: boolean;       // 処理が成功したか
  data: T | null;         // 成功時のデータ
  message?: string;       // 画面表示用メッセージ（「保存しました」等）
  error?: ApiError | null; // エラー詳細
}

/**
 * システム共通のエラー構造
 */
export interface ApiError {
  code?: string;          // エラー種別（'DUPLICATE_ENTRY', 'AUTH_ERROR' 等）
  message: string;        // ユーザー向けエラー文言
  details?: any;          // Supabase等の生のエラー情報
}

/**
 * 管理者による汎用アクション
 * GAS (Z_StatusFlow.js) の思想を継承
 */
export type AdminAction = 'APPROVE' | 'REJECT';