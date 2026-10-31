from rest_framework import serializers


class MovieSerializer(serializers.Serializer):

    title = serializers.CharField(
        max_length=200
    )

    description = serializers.CharField()

    genre = serializers.CharField(
        max_length=100
    )

    language = serializers.CharField(
        max_length=100
    )

    duration = serializers.IntegerField(
        min_value=1
    )

    poster = serializers.ImageField()


class MovieUpdateSerializer(serializers.Serializer):

    title = serializers.CharField(
        max_length=200,
        required=False
    )

    description = serializers.CharField(
        required=False
    )

    genre = serializers.CharField(
        max_length=100,
        required=False
    )

    language = serializers.CharField(
        max_length=100,
        required=False
    )

    duration = serializers.IntegerField(
        min_value=1,
        required=False
    )

    poster = serializers.ImageField(
        required=False
    )