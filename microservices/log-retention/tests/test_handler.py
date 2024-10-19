import sys

sys.path.append("..")

from src import app


def test_retention_updates_for_non_compliant_log_groups(logs_client, log_groups):
    # Given log groups
    # When the handler is called
    app.check_log_retention(logs_client)

    # Then PutRetentionPolicy should only be called if the retention policy doesn't match
    assert logs_client.put_retention_policy.call_count == 2
