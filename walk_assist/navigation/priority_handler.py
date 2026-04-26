from config import PRIORITY_OBJECTS


def get_priority(label):

    if label in PRIORITY_OBJECTS:
        return PRIORITY_OBJECTS[label]

    return None