from rest_framework import serializers

class ShowSerializer(serializers.Serializer):

    movie_id = serializers.CharField()
    theatre = serializers.CharField(max_length=200)
    city = serializers.CharField(max_length=100)
    screen = serializers.CharField(max_length=100)
    show_date = serializers.DateField()
    show_time = serializers.TimeField()
    price = serializers.IntegerField(min_value=1)