from rest_framework.decorators import (api_view,)
from rest_framework.response import (Response,)
from common.auth import (admin_required,)
from .services import (dashboard_statistics,)

@api_view(["GET"])
@admin_required
def dashboard(request):
    firebase_uid = request.firebase_user[
        "uid"
    ]
    return Response(
        dashboard_statistics(
            firebase_uid
        )
    )