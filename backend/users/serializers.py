   
from rest_framework import serializers

class UserRegisterSerializer(serializers.Serializer):

    firebase_uid = serializers.CharField(
        max_length=255
    )

    name = serializers.CharField(
        max_length=100
    )

    email = serializers.EmailField()

    role = serializers.CharField(
        max_length=20
    )

class UserUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=100
    )

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must be at least 3 characters."
            )

        if len(value) > 30:
            raise serializers.ValidationError(
                "Username cannot exceed 30 characters."
            )
            
        return value