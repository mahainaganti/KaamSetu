def validate_worker(data):

    required_fields = [

        "full_name",
        "phone",
        "gender",
        "preferred_language",
        "experience_years",
        "travel_radius_km",
        "average_rating",
        "verification_status",
        "availability_status",
        "location_id"

    ]

    for field in required_fields:

        if field not in data:

            return False, f"Missing required field: {field}"

    return True, None


def validate_rating(data):

    required_fields = [
        "booking_id",
        "employer_id",
        "worker_id",
        "rating"
    ]

    if not isinstance(data, dict):
        return False, "Invalid JSON data"

    for field in required_fields:

        if field not in data:
            return False, f"Missing required field: {field}"

    rating = data["rating"]

    if type(rating) is not int or rating < 1 or rating > 5:
        return False, "Rating must be an integer between 1 and 5"

    return True, None
