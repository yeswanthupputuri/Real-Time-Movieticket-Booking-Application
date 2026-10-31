from rest_framework import serializers

class BookingSerializer(serializers.Serializer):

    show_id = serializers.CharField()
    seats = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False,
    )