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
- F-11 施設情報の登録：施設管理担当は、施設情報を登録する
- F-12 施設情報の更新：施設管理担当や、登録された施設情報を更新する
- F-13 施設情報の削除：施設管理担当や、登録された施設情報を削除する
- F-21 施設予約情報の登録：施設管理担当は、施設予約情報を登録する
  - F-21a 施設当選情報の登録：システムは、予約申し込み施設から送られてきた施設抽選結果から当選した情報を予約情報として登録する　※予約当選結果はイベント管理機能と連携する
- F-22 施設予約情報の更新：施設管理担当や、登録された予約施設情報を更新する
  - F-22a 施設当落情報の更新：システムは、予約申し込み施設から送られてきた施設抽選結果を予約情報に反映する。
- F-23 施設予約情報の削除：施設管理担当や、登録された予約施設情報を削除する

## 備考
### イベント管理機能との連携
施設予約で当選した会場は、イベント管理でのイベント開催に使われる。ただし、同一日同一時間帯に複数当選する可能性がある、または主催者の都合によりかならず当選した会場がイベントで使われるとは限らない。
イベント管理に関連する施設情報は、次の通り
- 施設名
- 予約日
- 予約時間帯
- 予約コート数
