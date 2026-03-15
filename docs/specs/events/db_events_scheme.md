# supabaseテーブル構造
## events
column_name          data_type        is_nullable   default        備考
──────────────────────────────────────────────────────────────────────────────
event_id             bigint           NO            identity       PK。イベントの一意な識別子

title                text             NO            -              イベントタイトル

status               text (ENUM)      NO            'draft'        draft / published / closed /
                                                                   selecting / confirmed /
                                                                   finished / cancelled / disabled

facility_id          uuid             NO            -              facilities.id への外部キー（必須）

event_date           date             NO            -              開催日
start_time           time             NO            -              開始時刻
end_time             time             NO            -              終了時刻

registration_start   timestamptz      YES           null           募集開始。
                                                                   null の場合は「募集開始前」とみなす。

registration_end     timestamptz      YES           null           募集締切。
                                                                   null の場合は「締切未設定」とみなし、
                                                                   一般会員は申請不可（要件で明記）。

lottery_date         timestamptz      YES           null           抽選予定日時。
                                                                   null の場合は管理者手動で抽選開始。

capacity             integer          NO            -              定員（人単位）

parking_capacity     integer          YES           null           施設マスタ値のオーバーライド。
                                                                   null の場合は facility.parking_capacity_default を使用。

min_level            numeric(3,2)     YES           null           参加可能レベル下限（DUPR）
max_level            numeric(3,2)     YES           null           参加可能レベル上限（DUPR）

description          text             YES           null           募集詳細・注意事項

created_at           timestamptz      NO            now()          作成日時
updated_at           timestamptz      NO            now()          更新日時（アプリ側で更新）

## event_participants
column_name            data_type        is_nullable   default              備考
──────────────────────────────────────────────────────────────────────────────────────────────
id                     uuid             NO            gen_random_uuid()    PK

event_id               bigint           NO            -                    events.event_id FK
user_id                uuid             NO            -                    会員ID

partner_user_id        uuid             YES           null                 片側指名用。相互指名成立前のみ使用
pair_id                uuid             YES           null                 相互指名成立後の共通ID（抽選単位）

selection_status       text (ENUM)      NO            'pending'            pending / won / waitlist / lost

waitlist_order         integer          YES           null                 キャンセル待ち順位（waitlist のみ）

parking_request        boolean          NO            false                駐車場希望の有無
parking_status         text (ENUM)      NO            'none'               none / pending / won / waitlist / lost / declined

applied_fee            integer          NO            0                    当選確定時点の参加費（会計用固定値）

attendance             text (ENUM)      NO            'not_checked'        not_checked / present / absent

change_request_json    jsonb            YES           null                 C-05用。構造は別紙で定義（例：{new_partner_id, reason}）

cancel_date            timestamptz      YES           null                 辞退・取り消し日時

created_at             timestamptz      NO            now()                申請日時
updated_at             timestamptz      NO            now()                更新日時（アプリ側で更新）

## event_communications
column_name        data_type        is_nullable   default              備考
──────────────────────────────────────────────────────────────────────────────────────────────
id                 uuid             NO            gen_random_uuid()    PK

event_id           bigint           NO            -                    events.event_id FK

sender_id          uuid             NO            -                    発信者のID（会員 or 管理者）
sender_role        text (ENUM)      NO            -                    'member' or 'admin'

target_type        text (ENUM)      YES           null                 'participation' or 'pair'
target_reg_id      uuid             YES           null                 EventParticipation.id または Pair.id

message            text             NO            -                    メッセージ本文

is_admin_only      boolean          NO            false                true の場合は管理者のみ閲覧可

created_at         timestamptz      NO            now()                送信日時
