from datetime import datetime, timezone

def make_naive(dt: datetime):
    if dt and dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt