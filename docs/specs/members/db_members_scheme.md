# supabaseテーブル構造
## members 会員管理
| column_name            | data_type                | is_nullable |
| ---------------------- | ------------------------ | ----------- |
| id                     | uuid                     | NO          |
| member_number          | text                     | YES         |
| line_id                | text                     | YES         |
| nickname               | text                     | NO          |
| email                  | text                     | NO          |
| password               | text                     | YES         |
| name                   | text                     | NO          |
| name_roma              | text                     | NO          |
| gender                 | text                     | YES         |
| birthday               | date                     | YES         |
| tel                    | text                     | YES         |
| postal                 | text                     | YES         |
| address                | text                     | YES         |
| emg_tel                | text                     | NO          |
| emg_rel                | text                     | NO          |
| emg_memo               | text                     | YES         |
| member_kind            | text                     | NO          |
| status                 | text                     | NO          |
| roles                  | text                     | NO          |
| profile_memo           | text                     | YES         |
| notes                  | text                     | YES         |
| dupr_id                | text                     | YES         |
| dupr_email             | text                     | YES         |
| dupr_rate_doubles      | double precision         | YES         |
| dupr_rate_singles      | double precision         | YES         |
| dupr_rate_date         | date                     | YES         |
| introducer             | text                     | YES         |
| is_profile_public      | boolean                  | YES         |
| last_login_date        | timestamp with time zone | YES         |
| req_date               | timestamp with time zone | YES         |
| approval_date          | timestamp with time zone | YES         |
| suspend_date           | date                     | YES         |
| withdraw_date          | date                     | YES         |
| reject_date            | timestamp with time zone | YES         |
| create_date            | timestamp with time zone | YES         |
| update_date            | timestamp with time zone | YES         |
| reset_token            | text                     | YES         |
| reset_token_expires_at | timestamp with time zone | YES         |

