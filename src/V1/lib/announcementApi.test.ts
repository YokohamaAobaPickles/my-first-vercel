/**
 * Filename: src/lib/announcementApi.test.ts
 * Version : V1.0.0
 * Update  : 2026-02-25
 * Remarks : 
 * V1.0.0 新規作成。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as announcementApi from '@v1/lib/announcementApi';
import { supabase } from '@v1/lib/supabase';

// Supabaseクライアントのモック
vi.mock('@v1/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('announcementApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------
  // 一覧取得（基本）
  // -------------------------------------------------------
  describe('fetchAnnouncements (一覧取得)', () => {
    it('正常にお知らせ一覧を取得できること', async () => {
      const mockData = [
        { announcement_id: 1, title: 'テスト', status: 'published', is_pinned: true }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        then: (onfulfilled: any) =>
          Promise.resolve({ data: mockData, error: null }).then(onfulfilled),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await announcementApi.fetchAnnouncements();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  // -------------------------------------------------------
  // 一覧取得（is_read / read_count 対応）
  // -------------------------------------------------------
  describe('fetchAnnouncements (一覧取得: is_read / read_count)', () => {
    it('ログインユーザーの既読状態と既読数を含めて返すこと', async () => {
      const mockMemberId = 'user-123';

      // announcements のモックデータ
      const mockAnnouncements = [
        { announcement_id: 1, title: 'A', is_pinned: false, publish_date: '2026-02-01' },
        { announcement_id: 2, title: 'B', is_pinned: true, publish_date: '2026-02-05' },
      ];

      // announcement_reads のモックデータ
      const mockReads = [
        { announcement_id: 1, member_id: 'user-123' },
        { announcement_id: 1, member_id: 'user-999' },
        { announcement_id: 2, member_id: 'user-999' },
      ];

      // announcements 用モック
      const mockAnnouncementsQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: (onfulfilled: any) =>
          Promise.resolve({ data: mockAnnouncements, error: null }).then(onfulfilled),
      };

      // announcement_reads 用モック
      const mockReadsQuery = {
        select: vi.fn().mockResolvedValue({ data: mockReads, error: null }),
      };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'announcements') return mockAnnouncementsQuery as any;
        if (table === 'announcement_reads') return mockReadsQuery as any;
        return {} as any;
      });

      const result = await announcementApi.fetchAnnouncements(mockMemberId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);

      // 記事1 → ユーザー既読、read_count = 2
      expect(result.data?.[0].is_read).toBe(true);
      expect(result.data?.[0].read_count).toBe(2);

      // 記事2 → ユーザー未読、read_count = 1
      expect(result.data?.[1].is_read).toBe(false);
      expect(result.data?.[1].read_count).toBe(1);
    });
  });

  // -------------------------------------------------------
  // 既読記録
  // -------------------------------------------------------
  describe('recordRead (既読記録)', () => {
    it('既読レコードを upsert で正しく処理できること', async () => {
      const mockAnnouncementId = 101;
      const mockMemberId = 'user-uuid-123';

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        upsert: upsertMock,
      } as any);

      const result = await announcementApi.recordRead(
        mockAnnouncementId,
        mockMemberId
      );

      expect(result.success).toBe(true);

      // 第1引数: データの検証（read_at は任意の文字列を許容）
      // 第2引数: オプションの検証
      expect(upsertMock).toHaveBeenCalledWith(
        {
          announcement_id: mockAnnouncementId,
          member_id: mockMemberId,
          read_at: expect.any(String), // 生成される日時は不問とする
        },
        {
          onConflict: 'announcement_id, member_id',
        }
      );
    });
  });

  // -------------------------------------------------------
  // 詳細取得
  // -------------------------------------------------------
  describe('fetchAnnouncementById (詳細取得)', () => {
    it('指定したIDの記事を取得できること', async () => {
      const mockId = 1;
      const mockData = { announcement_id: mockId, title: '詳細テスト' };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await announcementApi.fetchAnnouncementById(mockId);

      expect(result.success).toBe(true);
      expect(mockQuery.eq).toHaveBeenCalledWith('announcement_id', mockId);
      expect(result.data?.announcement_id).toBe(mockId);
    });
  });

  // -------------------------------------------------------
  // 新規作成
  // -------------------------------------------------------
  describe('createAnnouncement (新規作成)', () => {
    it('正しいパラメータで記事を作成できること', async () => {
      const mockInput = { title: '新規', content: '内容', status: 'draft' };
      const mockAuthorId = 'author-uuid';

      const insertMock = vi.fn().mockReturnThis();
      const selectMock = vi.fn().mockReturnThis();
      const singleMock = vi.fn().mockResolvedValue({ data: mockInput, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        insert: insertMock,
        select: selectMock,
        single: singleMock,
      } as any);

      const result = await announcementApi.createAnnouncement(
        mockInput as any
      );

      expect(result.success).toBe(true);
      expect(insertMock).toHaveBeenCalledWith([
        expect.objectContaining({
          title: mockInput.title,
          content: mockInput.content,
          status: mockInput.status,
        }),
      ]);

    });
  });

  // -------------------------------------------------------
  // 記事更新
  // -------------------------------------------------------
  describe('updateAnnouncement (記事更新)', () => {
    it('指定したIDの記事を更新できること', async () => {
      const mockId = 1;
      const mockInput = { title: '更新後' };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockInput, updated_at: '2026-02-09T00:00:00.000Z' },
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      const result = await announcementApi.updateAnnouncement(mockId, mockInput);

      expect(result.success).toBe(true);

      // ★ updated_at が追加されるため、objectContaining に変更
      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '更新後',
          updated_at: expect.any(String),
        })
      );

      expect(mockQuery.eq).toHaveBeenCalledWith('announcement_id', mockId);
    });

    it('指定したIDの記事を更新し、更新日がセットされること', async () => {
      const mockId = 1;
      const mockInput = { title: '更新タイトル' };

      const updateMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();
      const selectMock = vi.fn().mockReturnThis();
      const singleMock = vi.fn().mockResolvedValue({
        data: {
          announcement_id: mockId,
          title: '更新タイトル',
          updated_at: '2026-02-09T00:00:00.000Z',
        },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: updateMock,
        eq: eqMock,
        select: selectMock,
        single: singleMock,
      } as any);

      const result = await announcementApi.updateAnnouncement(mockId, mockInput);

      expect(result.success).toBe(true);

      // ★ updated_at が含まれていることを検証
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '更新タイトル',
          updated_at: expect.any(String),
        })
      );
    });
  });

  // -------------------------------------------------------
  // 記事削除
  // -------------------------------------------------------
  describe('deleteAnnouncement (記事削除)', () => {
    it('指定したIDの記事を物理削除できること', async () => {
      const mockId = 99;

      const deleteMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from).mockReturnValue({
        delete: deleteMock,
        eq: eqMock,
      } as any);

      const result = await announcementApi.deleteAnnouncement(mockId);

      expect(result.success).toBe(true);
      expect(deleteMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('announcement_id', mockId);
    });
  });
});

// -------------------------------------------------------
// 既読詳細取得
// -------------------------------------------------------
describe('fetchReadDetails (既読詳細取得)', () => {
  it('指定した記事の既読者リストを会員情報付きで取得できること', async () => {
    const mockId = 1;
    const mockReadDetails = [
      {
        read_at: '2026-02-08T10:00:00Z',
        member_id: 'user-1',
        members: {
          name: '山田太郎',
          nickname: 'たろう'
        }
      }
    ];

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockReadDetails, error: null }),
    };

    vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

    const result = await announcementApi.fetchReadDetails(mockId);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].members?.nickname).toBe('たろう');
  });
});
