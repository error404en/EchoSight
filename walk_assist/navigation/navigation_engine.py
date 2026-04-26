from walk_assist.navigation.priority_handler import get_priority

PRIORITY_WEIGHT = {
    "high": 120,
    "medium": 70,
    "low": 30
}

CENTER_BONUS = 50


def calculate_distance_score(bbox):
    x1, y1, x2, y2 = bbox
    height = y2 - y1

    # 🔥 clamp to avoid extreme dominance
    return min(height, 200)


def center_bonus(bbox, frame_width):
    x1, y1, x2, y2 = bbox
    center_x = (x1 + x2) / 2

    zone_left = frame_width / 3
    zone_right = 2 * frame_width / 3

    if zone_left < center_x < zone_right:
        return CENTER_BONUS

    return 0


def choose_top_object(objects, frame_width):

    best_score = -1
    best_object = None

    for obj in objects:

        label = obj["label"]
        bbox = obj["bbox"]

        priority = get_priority(label)

        if priority is None:
            continue

        x1, y1, x2, y2 = bbox
        height = y2 - y1

        # 🔥 Ignore far objects (noise reduction)
        if height < 60:
            continue

        # 🔥 Pothole special handling (only when near)
        if label == "pothole" and height < 120:
            continue

        priority_score = PRIORITY_WEIGHT[priority]
        distance_score = calculate_distance_score(bbox)
        center_score = center_bonus(bbox, frame_width)

        total_score = priority_score + distance_score + center_score

        if total_score > best_score:
            best_score = total_score
            best_object = obj

    return best_object