from rest_framework.decorators import api_view
from rest_framework.response import Response

from common.mongodb import client


@api_view(["GET"])
def health_check(request):
    try:
        client.admin.command("ping")

        return Response({
            "status": "connected",
            "database": "MongoDB Atlas"
        })

    except Exception as e:
        return Response({
            "status": "failed",
            "error": str(e)
        }, status=500)