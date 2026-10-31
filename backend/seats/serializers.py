from rest_framework import serializers

class HoldSeatSerializer(serializers.Serializer):

    show_id = serializers.CharField()
    seat_numbers = serializers.ListField(
        child=serializers.CharField()
    )