# supabaseテーブル構造
## members
| column_name            | data_type                | is_nullable |
| ---------------------- | ------------------------ | ----------- |
| id                     | uuid                     | NO          |
| member_number          | text                     | YES         |
| line_id                | text                     | YES         |
| email                  | text                     | NO          |
| name                   | text                     | NO          |
| name_roma              | text                     | NO          |
| nickname               | text                     | NO          |
| tel                    | text                     | YES         |
| postal                 | text                     | YES         |
| address                | text                     | YES         |
| emg_tel                | text                     | NO          |
| emg_rel                | text                     | NO          |
| status                 | text                     | NO          |
| member_kind            | text                     | NO          |
| roles                  | text                     | NO          |
| dupr_id                | text                     | YES         |
| notes                  | text                     | YES         |
| is_profile_public      | boolean                  | YES         |
| last_login_date        | timestamp with time zone | YES         |
| req_date               | timestamp with time zone | YES         |
| suspend_date           | date                     | YES         |
| withdraw_date          | date                     | YES         |
| create_date            | timestamp with time zone | YES         |
| update_date            | timestamp with time zone | YES         |
| password               | text                     | YES         |
| dupr_email             | text                     | YES         |
| reset_token            | text                     | YES         |
| reset_token_expires_at | timestamp with time zone | YES         |
| profile_memo           | text                     | YES         |
| emg_memo               | text                     | YES         |
| introducer             | text                     | YES         |
| approval_date          | timestamp with time zone | YES         |
| reject_date            | timestamp with time zone | YES         |
| dupr_rate_doubles      | double precision         | YES         |
| dupr_rate_date         | date                     | YES         |
| gender                 | text                     | YES         |
| birthday               | date                     | YES         |
| dupr_rate_singles      | double precision         | YES         |

