# supabaseテーブル構造

## announcements お知らせ管理テーブル
| column_name  | data_type                | is_nullable |
| ------------ | ------------------------ | ----------- |
| id           | bigint                   | NO          |
| title        | text                     | NO          |
| content      | text                     | YES         |
| publish_date | date                     | YES         |
| status       | text                     | YES         |
| author_id    | text                     | YES         |
| is_pinned    | boolean                  | NO          |
| target_role  | text                     | YES         |
| created_at   | timestamp with time zone | YES         |
| updated_at   | timestamp with time zone | YES         |
| end_date     | date                     | YES         |

## announcement_reads 既読管理テーブル
| column_name     | data_type                | is_nullable |
| --------------- | ------------------------ | ----------- |
| id              | uuid                     | NO          |
| announcement_id | bigint                   | YES         |
| line_id         | text                     | YES         |
| read_at         | timestamp with time zone | YES         |