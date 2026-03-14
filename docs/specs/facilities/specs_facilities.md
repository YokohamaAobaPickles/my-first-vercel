# F群　施設利用管理
## 施設利用管理とは
施設はクラブ主催のイベントを行う場所。地区センターや市の体育館、小学校、中学校の体育館がある。なお、各施設を利用するためには、団体登録が必要になる。団体登録は、いくつかの施設で共通のものと、各施設ごと個々に登録するものがある。各施設は、毎月の抽選で利用可否が決まる。利用抽選日までに各施設ごとに利用抽選を申し込まなければならない。
## 施設管理要素
施設管理要素群は以下の通り
### 施設(facilities)
- 施設名(facility_name)
- 住所(facility_address)
- 電話番号(facility_phone)
- メールアドレス(facility_mail)
- 施設URL(facility_url)
- 登録団体名(group_name)
- 団体登録日(group_registration_date)
- 団体登録更新期限(group_renewal_date)
- 団体登録料(group_registration_fee)
- 団体年会費(group_annual_fee)
- 施設利用料金(facility_fee)
- コート番号(facility_court_number)
- 駐車場利用台数(parking_capacity)
- 利用抽選日(lottery_date)
- 施設メモ(facility_notes)
### 予約(facility_reservations)
- 予約番号(reservation_number)
- 予約日(reservation_date)
- 予約時間(reservation_time_slot)
- 予約コート数(reserved_courts)
- 費用(reserved_fee)
- 費用支払い期限(reservation_limit)
- 予約者(reserver_name)　※会員番号と連動
- 利用抽選当落情報(lottery_results)
- 予約メモ(reservation_notes)
### 登録団体(registration_groups)
- 登録団体名(registration_club_name)
- 登録団体施設群(registration_facilities)
- 登録団体番号(registration_club_number)
- 代表者名(club_representative) ※会員番号と連動
- 副代表者名(club_vice_representative) ※会員番号と連動
- 団体登録メモ(registration_club_notes)

## ユースケース
- F-01 登録団体情報の登録：施設管理担当は、登録団体情報を登録する
- F-02 登録団体情報の更新：施設管理担当や、登録された登録団体情報を更新する
- F-03 登録団体情報の削除：施設管理担当や、登録された登録団体情報を削除する
- F-04 登録団体一覧の参照：登録された団体情報の一覧を参照する
- F-05 登録団体詳細の参照：登録された団体情報の詳細を参照する
- F-11 施設情報の登録：施設管理担当は、施設情報を登録する
- F-12 施設情報の更新：施設管理担当や、登録された施設情報を更新する
- F-13 施設情報の削除：施設管理担当や、登録された施設情報を削除する
- F-14 施設一覧の参照：登録された施設情報の一覧を参照する
- F-15 施設詳細の参照：登録された施設情報の詳細を参照する
- F-21 施設予約情報の登録：施設管理担当は、施設予約情報を登録する
  - F-21a 施設当選情報の登録：システムは、予約申し込み施設から送られてきた施設抽選結果から当選した情報を予約情報として登録する　※予約当選結果はイベント管理機能と連携する
- F-22 施設予約情報の更新：施設管理担当や、登録された予約施設情報を更新する
  - F-22a 施設当落情報の更新：システムは、予約申し込み施設から送られてきた施設抽選結果を予約情報に反映する。
- F-23 施設予約情報の削除：施設管理担当や、登録された予約施設情報を削除する
- F-24 施設予約情報一覧の参照：登録された施設予約情報の一覧を参照する
- F-25 施設予約詳細の参照：登録された施設予約情報の詳細を参照する


## 備考
### イベント管理機能との連携
施設予約で当選した会場は、イベント管理でのイベント開催に使われる。ただし、同一日同一時間帯に複数当選する可能性がある、または主催者の都合によりかならず当選した会場がイベントで使われるとは限らない。
イベント管理に関連する施設情報は、次の通り
- 施設名
- 予約日
- 予約時間帯
- 予約コート数

## DB定義
### 登録団体
#### SQL文
> --
> -- Filename: 20260303_create_registration_groups.sql
> -- Version: V1.0.0
> -- Update: 2026-03-03
> -- Remarks: F-01〜F-03 登録団体管理テーブルの新規作成
> --
> 
> CREATE TABLE IF NOT EXISTS registration_groups (
>     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>     registration_club_name TEXT NOT NULL,
>     registration_club_number TEXT,
>     representative_id TEXT REFERENCES members(member_number), -- 会員番号と連動
>     vice_representative_id TEXT REFERENCES members(member_number), -- 副代表
>     registration_club_notes TEXT,
>     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
>     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
> );
> 
> -- 更新日時自動更新用のトリガー（必要に応じて）
> CREATE OR REPLACE FUNCTION update_updated_at_column()
> RETURNS TRIGGER AS $$
> BEGIN
>     NEW.updated_at = CURRENT_TIMESTAMP;
>     RETURN NEW;
> END;
> $$ language 'plpgsql';
> 
> CREATE TRIGGER update_registration_groups_updated_at
>     BEFORE UPDATE ON registration_groups
>     FOR EACH ROW
>     EXECUTE PROCEDURE update_updated_at_column();
#### DB構造
| column_name              | data_type                | is_nullable | column_default    |
| ------------------------ | ------------------------ | ----------- | ----------------- |
| id                       | uuid                     | NO          | gen_random_uuid() |
| registration_club_name   | text                     | NO          | null              |
| registration_club_number | text                     | YES         | null              |
| representative_id        | text                     | YES         | null              |
| vice_representative_id   | text                     | YES         | null              |
| registration_club_notes  | text                     | YES         | null              |
| created_at               | timestamp with time zone | YES         | CURRENT_TIMESTAMP |
| updated_at               | timestamp with time zone | YES         | CURRENT_TIMESTAMP |
### 施設情報
#### SQL文
> -- Facilitiesテーブルの作成
> CREATE TABLE IF NOT EXISTS public.facilities (
>     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>     facility_name TEXT NOT NULL,
>     address TEXT,
>     map_url TEXT,
>     facility_notes TEXT,
>     registration_group_id UUID REFERENCES public.registration_groups(id) ON DELETE SET NULL,
>     created_at TIMESTAMPTZ DEFAULT now(),
>     updated_at TIMESTAMPTZ DEFAULT now()
> );
> 
> -- 更新日時（updated_at）を自動更新するトリガーの適用
> -- (既に registration_groups 等で作成済みの場合は、この関数定義はスキップ可)
> CREATE OR REPLACE FUNCTION update_updated_at_column()
> RETURNS TRIGGER AS $$
> BEGIN
>     NEW.updated_at = now();
>     RETURN NEW;
> END;
> $$ language 'plpgsql';
> 
> CREATE TRIGGER update_facilities_updated_at
>     BEFORE UPDATE ON public.facilities
>     FOR EACH ROW
>     EXECUTE PROCEDURE update_updated_at_column();
> 
- テーブル構造のポイント
  - 外部キー制約: registration_group_id は registration_groups テーブルの id を参照しています。団体が削除された場合、施設データは残るように ON DELETE SET NULL を設定しています。
  - 自動採番: id は UUID で自動生成されます。
  - タイムスタンプ: created_at と updated_at でデータの履歴を管理します。
#### 追加SQL文
> -- facilitiesテーブルの定義を仕様書に合わせて拡張
> ALTER TABLE public.facilities 
> ADD COLUMN IF NOT EXISTS phone text,                    -- 電話番号
> ADD COLUMN IF NOT EXISTS email text,                    -- メールアドレス
> ADD COLUMN IF NOT EXISTS facility_url text,             -- 施設URL
> ADD COLUMN IF NOT EXISTS registration_date date,        -- 団体登録日
> ADD COLUMN IF NOT EXISTS renewal_date date,             -- 団体登録更新期限
> ADD COLUMN IF NOT EXISTS registration_fee integer,      -- 団体登録料
> ADD COLUMN IF NOT EXISTS annual_fee integer,            -- 団体年会費
> ADD COLUMN IF NOT EXISTS facility_fee_desc text,        -- 施設利用料金(説明文)
> ADD COLUMN IF NOT EXISTS court_numbers text,            -- コート番号(例: 1,2番)
> ADD COLUMN IF NOT EXISTS parking_capacity integer,      -- 駐車場利用台数
> ADD COLUMN IF NOT EXISTS lottery_date_desc text;        -- 利用抽選日(説明文)
> -- 各カラムにコメントを追加（メンテナンス性向上）
> COMMENT ON COLUMN public.facilities.phone IS '施設電話番号';
> COMMENT ON COLUMN public.facilities.email IS '施設メールアドレス';
> COMMENT ON COLUMN public.facilities.facility_url IS '施設公式URL';
> COMMENT ON COLUMN public.facilities.registration_date IS '団体登録日';
> COMMENT ON COLUMN public.facilities.renewal_date IS '団体登録更新期限';
> COMMENT ON COLUMN public.facilities.registration_fee IS '団体登録料';
> COMMENT ON COLUMN public.facilities.annual_fee IS '団体年会費';
> COMMENT ON COLUMN public.facilities.facility_fee_desc IS '利用料金体系';
> COMMENT ON COLUMN public.facilities.court_numbers IS '所有コート番号';
> COMMENT ON COLUMN public.facilities.parking_capacity IS '駐車場利用可能台数';
> COMMENT ON COLUMN public.facilities.lottery_date_desc IS '抽選申込日等の説明';
#### DB構造
| column_name           | data_type                | is_nullable | column_default    |
| --------------------- | ------------------------ | ----------- | ----------------- |
| id                    | uuid                     | NO          | gen_random_uuid() |
| facility_name         | text                     | NO          | null              |
| address               | text                     | YES         | null              |
| map_url               | text                     | YES         | null              |
| facility_notes        | text                     | YES         | null              |
| registration_group_id | uuid                     | YES         | null              |
| created_at            | timestamp with time zone | YES         | now()             |
| updated_at            | timestamp with time zone | YES         | now()             |
| phone                 | text                     | YES         | null              |
| email                 | text                     | YES         | null              |
| facility_url          | text                     | YES         | null              |
| registration_date     | date                     | YES         | null              |
| renewal_date          | date                     | YES         | null              |
| registration_fee      | integer                  | YES         | null              |
| annual_fee            | integer                  | YES         | null              |
| facility_fee_desc     | text                     | YES         | null              |
| court_numbers         | text                     | YES         | null              |
| parking_capacity      | integer                  | YES         | null              |
| lottery_date_desc     | text                     | YES         | null              |
### 予約情報
#### SQL文
> -- FacilityReservationsテーブルの作成
> CREATE TABLE IF NOT EXISTS public.facility_reservations (
>     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>     facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
>     registration_group_id UUID REFERENCES public.registration_groups(id) ON DELETE SET NULL,
>     reservation_number TEXT,
>     reservation_date DATE NOT NULL,
>     reservation_time_slot TEXT NOT NULL,
>     reserved_courts INTEGER DEFAULT 1,
>     reserved_fee INTEGER DEFAULT 0,
>     reservation_limit DATE,
>     reserver_name TEXT,
>     lottery_results TEXT,
>     reservation_notes TEXT,
>     created_at TIMESTAMPTZ DEFAULT now(),
>     updated_at TIMESTAMPTZ DEFAULT now()
> );
> -- 更新日時自動更新トリガー
> CREATE TRIGGER update_facility_reservations_updated_at
>     BEFORE UPDATE ON public.facility_reservations
>     FOR EACH ROW
>     EXECUTE PROCEDURE update_updated_at_column();
#### DB構造
| column_name           | data_type                | is_nullable | column_default    |
| --------------------- | ------------------------ | ----------- | ----------------- |
| id                    | uuid                     | NO          | gen_random_uuid() |
| facility_id           | uuid                     | NO          | null              |
| registration_group_id | uuid                     | YES         | null              |
| reservation_number    | text                     | YES         | null              |
| reservation_date      | date                     | NO          | null              |
| reservation_time_slot | text                     | NO          | null              |
| reserved_courts       | integer                  | YES         | 1                 |
| reserved_fee          | integer                  | YES         | 0                 |
| reservation_limit     | date                     | YES         | null              |
| reserver_name         | text                     | YES         | null              |
| lottery_results       | text                     | YES         | null              |
| reservation_notes     | text                     | YES         | null              |
| created_at            | timestamp with time zone | YES         | now()             |
| updated_at            | timestamp with time zone | YES         | now()             |

## ファイル構造
src/app/facilities/
├── page.tsx                # 【一般】info/に遷移【管理】管理メニュー表示
│
├──/info                    # 【一般/管理】
│   ├── page.tsx            # 【一般】施設一覧
│   ├── new/page.tsx        # 【管理】施設新規登録
│   ├── [id]/page.tsx       # 【一般】施設詳細
│   └── edit/page.tsx       # 【管理】施設情報編集
│
├── groups/                 # 【管理】登録団体関連（そのまま移動）
│   ├── page.tsx            # 団体一覧 [F-04]
│   ├── new/page.tsx        # 団体新規登録 [F-01]
│   └── [id]/page.tsx       # 団体詳細表示 [F-05]
│        └── edit/page.tsx  # 団体情報編集 [F-02,F-03]
│
└── reservations/           # 【管理】予約関連（そのまま移動）
    ├── page.tsx            # 予約一覧 [F-04]
    ├── new/page.tsx        # 予約新規登録 [F-01]
    └── [id]/page.tsx       # 予約詳細表示 [F-05]
         └── edit/page.tsx  # 予約情報編集 [F-02,F-03]
