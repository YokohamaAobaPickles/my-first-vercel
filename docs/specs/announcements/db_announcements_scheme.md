# Supabeseテーブル構造
## announcements お知らせ管理
| column_name     | data_type                | is_nullable |
| --------------- | ------------------------ | ----------- |
| announcement_id | bigint                   | NO          |
| author_id       | text                     | YES         |
| title           | text                     | NO          |
| content         | text                     | YES         |
| status          | text                     | YES         |
| is_pinned       | boolean                  | NO          |
| target_role     | text                     | YES         |
| publish_date    | date                     | YES         |
| end_date        | date                     | YES         |
| created_at      | timestamp with time zone | YES         |
| updated_at      | timestamp with time zone | YES         |

## announcement_reads 既読管理
| column_name     | data_type                | is_nullable |
| --------------- | ------------------------ | ----------- |
| read_id         | uuid                     | NO          |
| announcement_id | bigint                   | YES         |
| member_id       | uuid                     | YES         |
| read_at         | timestamp with time zone | YES         |