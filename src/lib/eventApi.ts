/**
 * Filename: src/lib/eventApi.ts
 * Version : V1.3.1
 * Update  : 2026-02-27
 * Remarks :
 * - V1.3.1 抽選・ステータス判定ロジックを utils/eventHelpers へ移設
 * - V1.3.0 createParticipant に抽選/先着・キャンセル待ち判定ロジックを実装
 * - V1.2.0 イベント更新 updateEvent・削除 deleteEvent を追加
 * - V1.1.0 イベント新規作成 createEvent を追加
 * - V1.0.0 イベント管理（events / participants）API の初期実装
 */

import { supabase } from './supabase';
import { ApiResponse } from '@/types/common';
import {
  Event,
  EventInput,
  EventUpdateInput,
  Participant,
  ParticipantInput,
  ParticipantUpdateInput
} from '@/types/event';
import { calculateParticipantStatus } from '@/utils/eventHelpers';

/* -------------------------------------------------------
 * イベント一覧を取得
 * ------------------------------------------------------- */
export const fetchEvents = async (): Promise<ApiResponse<Event[]>> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return { success: true, data: (data as Event[]) ?? [] };
  } catch (error: any) {
    console.error('fetchEvents Error:', error);
    return {
      success: false,
      data: null,
      error: { message: 'イベント一覧の取得に失敗しました。', details: error },
    };
  }
};

/* -------------------------------------------------------
 * イベント新規作成
 * ------------------------------------------------------- */
export const createEvent = async (
  input: EventInput
): Promise<ApiResponse<Event>> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([input])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Event };
  } catch (error: any) {
    console.error('createEvent Error:', error);
    return {
      success: false,
      data: null,
      error: {
        message: 'イベントの作成に失敗しました。',
        details: error,
      },
    };
  }
};

/* -------------------------------------------------------
 * イベント詳細を取得
 * ------------------------------------------------------- */
export const fetchEventById = async (
  event_id: number
): Promise<ApiResponse<Event>> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', event_id)
      .single();

    if (error) throw error;

    return { success: true, data: data as Event };
  } catch (error: any) {
    console.error('fetchEventById Error:', error);
    return {
      success: false,
      data: null,
      error: { message: 'イベント情報の取得に失敗しました。', details: error },
    };
  }
};

/* -------------------------------------------------------
 * イベント更新
 * ------------------------------------------------------- */
export const updateEvent = async (
  event_id: number,
  input: EventUpdateInput
): Promise<ApiResponse<Event>> => {
  try {
    const payload = {
      ...input,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('event_id', event_id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Event };
  } catch (error: any) {
    console.error('updateEvent Error:', error);
    return {
      success: false,
      data: null,
      error: {
        message: 'イベントの更新に失敗しました。',
        details: error,
      },
    };
  }
};

/* -------------------------------------------------------
 * イベント削除
 * ------------------------------------------------------- */
export const deleteEvent = async (
  event_id: number
): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('event_id', event_id);

    if (error) throw error;

    return { success: true, data: null };
  } catch (error: any) {
    console.error('deleteEvent Error:', error);
    return {
      success: false,
      data: null,
      error: {
        message: 'イベントの削除に失敗しました。',
        details: error,
      },
    };
  }
};

/* -------------------------------------------------------
 * 特定イベントの参加者一覧を取得
 * ------------------------------------------------------- */
export const fetchParticipantsByEvent = async (
  event_id: number
): Promise<ApiResponse<Participant[]>> => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('event_id', event_id);

    if (error) throw error;

    return { success: true, data: (data as Participant[]) ?? [] };
  } catch (error: any) {
    console.error('fetchParticipantsByEvent Error:', error);
    return {
      success: false,
      data: null,
      error: { message: '参加者情報の取得に失敗しました。', details: error },
    };
  }
};

/* -------------------------------------------------------
 * 特定ユーザーの参加状況を取得（イベント × ユーザー）
 * ------------------------------------------------------- */
export const fetchParticipant = async (
  event_id: number,
  user_id: string
): Promise<ApiResponse<Participant | null>> => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, data: (data as Participant) ?? null };
  } catch (error: any) {
    console.error('fetchParticipant Error:', error);
    return {
      success: false,
      data: null,
      error: { message: '参加状況の取得に失敗しました。', details: error },
    };
  }
};

/* -------------------------------------------------------
 * 参加申請（INSERT）抽選・先着・キャンセル待ち判定（utils に委譲）
 * ------------------------------------------------------- */
export const createParticipant = async (
  input: ParticipantInput
): Promise<ApiResponse<Participant>> => {
  try {
    const eventRes = await fetchEventById(input.event_id);
    if (!eventRes.success || !eventRes.data) {
      return {
        success: false,
        data: null,
        error: {
          message: 'イベントが見つかりません。',
          details: eventRes.error,
        },
      };
    }
    const event = eventRes.data;
    const participantsRes = await fetchParticipantsByEvent(input.event_id);
    const participants = participantsRes.success && participantsRes.data
      ? participantsRes.data
      : [];

    const { status, parking } = calculateParticipantStatus(
      event,
      participants,
      input.parking_requested
    );

    const row = {
      ...input,
      status,
      parking,
    };

    const { data, error } = await supabase
      .from('participants')
      .insert([row])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Participant };
  } catch (error: any) {
    console.error('createParticipant Error:', error);
    return {
      success: false,
      data: null,
      error: { message: '参加申請に失敗しました。', details: error },
    };
  }
};

/* -------------------------------------------------------
 * 参加内容の更新（PATCH）
 * ------------------------------------------------------- */
export const updateParticipant = async (
  participant_id: number,
  input: ParticipantUpdateInput
): Promise<ApiResponse<Participant>> => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('participant_id', participant_id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Participant };
  } catch (error: any) {
    console.error('updateParticipant Error:', error);
    return {
      success: false,
      data: null,
      error: { message: '参加内容の更新に失敗しました。', details: error },
    };
  }
};

/* -------------------------------------------------------
 * 参加キャンセル
 * ------------------------------------------------------- */
export const cancelParticipant = async (
  participant_id: number
): Promise<ApiResponse> => {
  try {
    const { error } = await supabase
      .from('participants')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('participant_id', participant_id);

    if (error) throw error;

    return { success: true, data: null };
  } catch (error: any) {
    console.error('cancelParticipant Error:', error);
    return {
      success: false,
      data: null,
      error: { message: '参加キャンセルに失敗しました。', details: error },
    };
  }
};
