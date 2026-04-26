def get_position(bbox, frame_width):

    x1, y1, x2, y2 = bbox

    center_x = (x1 + x2) / 2

    if center_x < frame_width / 3:
        return "on your left"

    elif center_x > 2 * frame_width / 3:
        return "on your right"

    else:
        return "ahead"


def estimate_distance(bbox):

    x1, y1, x2, y2 = bbox

    height = y2 - y1

    if height > 250:
        return "very close"

    elif height > 150:
        return "near"

    else:
        return "far"