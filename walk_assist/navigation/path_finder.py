def detect_path(objects, frame_width):

    left_blocked = False
    center_blocked = False
    right_blocked = False

    left_zone = frame_width / 3
    right_zone = 2 * frame_width / 3

    for obj in objects:

        label = obj["label"]
        x1, y1, x2, y2 = obj["bbox"]

        center_x = (x1 + x2) / 2
        height = y2 - y1

        # 🔥 Ignore far objects
        if height < 60:
            continue

        # 🔥 Pothole only if near
        if label == "pothole" and height < 120:
            continue

        if center_x < left_zone:
            left_blocked = True

        elif center_x > right_zone:
            right_blocked = True

        else:
            center_blocked = True

    # 🔥 SMART DECISION LOGIC

    # Center blocked → try to escape
    if center_blocked:

        if not left_blocked:
            return "move left"

        if not right_blocked:
            return "move right"

        return "obstacle ahead"

    # Center clear
    if left_blocked and not right_blocked:
        return "move right"

    if right_blocked and not left_blocked:
        return "move left"

    return "path clear"