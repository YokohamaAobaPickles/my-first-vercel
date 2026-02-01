## announcements
| column_name  | data_type                | is_nullable |
| ------------ | ------------------------ | ----------- |
| id           | bigint                   | NO          |
| created_at   | timestamp with time zone | YES         |
| title        | text                     | NO          |
| content      | text                     | YES         |
| publish_date | date                     | YES         |
| status       | text                     | YES         |
| author_id    | text                     | YES         |
| updated_at   | timestamp with time zone | YES         |
| is_pinned    | boolean                  | NO          |
| target_role  | text                     | YES         |
| end_date     | date                     | YES         |

## announcement_reads
| column_name     | data_type                | is_nullable |
| --------------- | ------------------------ | ----------- |
| id              | uuid                     | NO          |
| announcement_id | bigint                   | YES         |
| line_id         | text                     | YES         |
| read_at         | timestamp with time zone | YES         |