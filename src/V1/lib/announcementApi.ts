/**
 * Filename: src/lib/announcementApi.ts
 * Version : V1.0.0
 * Update  : 2026-02-25
 * Remarks : 
 * V1.0.0 新規作成。
 */

import { supabase } from '@v1/lib/supabase';
import { ApiResponse } from '@v1/types/common';
import {
  Announcement,
  AnnouncementInput,
  AnnouncementReadDetail,
  AnnouncementListItem
} from '@v1/types/announcement';

/**
 * お知らせ一覧を取得する
 * memberId が指定された場合、各記事の既読状態(is_read)と既読数(read_count)を付与する
 */
export const fetchAnnouncements = async (
  memberId?: string
): Promise<ApiResponse<AnnouncementListItem[]>> => {
  try {
    // 1. お知らせ一覧を取得
    const { data: announcements, error: aError } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('publish_date', { ascending: false });

    if (aError) throw aError;
    if (!announcements) return { success: true, data: [] };

    // 2. 既読情報を全件取得（集計用）
    const { data: allReads, error: rError } = await supabase
      .from('announcement_reads')
      .select('announcement_id, member_id');

    if (rError) throw rError;

    // 3. データをマージして AnnouncementListItem を作成
    const enrichedData: AnnouncementListItem[] = announcements.map((item) => {
      const readsForThisItem = allReads?.filter(
        (r) => r.announcement_id === item.announcement_id
      ) || [];

      return {
        ...item,
        is_read: memberId
          ? readsForThisItem.some((r) => r.member_id === memberId)
          : false,
        read_count: readsForThisItem.length,
      };
    });

    return { success: true, data: enrichedData };
  } catch (error: any) {
    console.error('fetchAnnouncements Error:', error);
    return {
      success: false,
      data: null,
      error: { message: 'お知らせの取得に失敗しました。', details: error },
    };
  }
};

/**
 * 既読を記録する
 */
export const recordRead = async (
  announcement_id: number,
  member_id: string
): Promise<ApiResponse> => {
  try {
    // upsertを使用し、重複時は何もしない(または更新する)設定にする
    const { error } = await supabase
      .from('announcement_reads')
      .upsert(
        { announcement_id, member_id, read_at: new Date().toISOString() },
        { onConflict: 'announcement_id, member_id' }
      );
    if (error) throw error;

    return { success: true, data: null };
  } catch (error: any) {
    console.error('recordRead Error:', error);
    return {
      success: false,
      data: null,
      error: { message: '既読の記録に失敗しました。', details: error },
    };
  }
};

/**
 * 特定のお知らせを1件取得する
 */
export const fetchAnnouncementById = async (
  announcement_id: number
): Promise<ApiResponse<Announcement>> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('announcement_id', announcement_id)
      .single();

    if (error) throw error;

    return { success: true, data: data as Announcement };
  } catch (error: any) {
    console.error('fetchAnnouncementById Error:', error);
    return {
      success: false,
      data: null,
      error: { message: '記事情報の取得に失敗しました。', details: error },
    };
  }
};

/**
 * お知らせを新規作成する
 */
export const createAnnouncement = async (
  input: AnnouncementInput
): Promise<ApiResponse<Announcement>> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert([input])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Announcement };
  } catch (error: any) {
    console.error('createAnnouncement Error:', error);
    return {
      success: false,
      data: null,
      error: { message: 'お知らせの作成に失敗しました。', details: error },
    };
  }
};

/**
 * お知らせを更新する
 */
export const updateAnnouncement = async (
  announcement_id: number,
  input: Partial<AnnouncementInput>
): Promise<ApiResponse<Announcement>> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
        })
      .eq('announcement_id', announcement_id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data as Announcement,
    };
  } catch (error: any) {
    console.error('updateAnnouncement Error:', error);
    return {
      success: false,
      data: null,
      error: { message: 'お知らせの更新に失敗しました。', details: error },
    };
  }
};

/**
 * お知らせを物理削除する
 */
export const deleteAnnouncement = async (
  announcement_id: number
): Promise<ApiResponse> => {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('announcement_id', announcement_id);

    if (error) throw error;

    return { success: true, data: null };
  } catch (error: any) {
    console.error('deleteAnnouncement Error:', error);
    return {
      success: false,
      data: null,
      error: { message: 'お知らせの削除に失敗しました。', details: error },
    };
  }
};

/**
 * 既読詳細（誰がいつ読んだか）を取得する
 * B-15 要件：member_code / nickname / email / name を返す
 */
export const fetchReadDetails = async (
  announcement_id: number
): Promise<ApiResponse<AnnouncementReadDetail[]>> => {
  try {
    const { data, error } = await supabase
      .from('announcement_reads')
      .select(`
        read_at,
        member_id,
        members (
          member_number,
          nickname,
          email,
          name
        )
      `)
      .eq('announcement_id', announcement_id)
      .order('read_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: (data as unknown as AnnouncementReadDetail[]) ?? [],
    };
  } catch (error: any) {
    console.error('fetchReadDetails Error:', error);
    return {
      success: false,
      data: null,
      error: { message: '既読情報の取得に失敗しました。', details: error },
    };
  }
};
