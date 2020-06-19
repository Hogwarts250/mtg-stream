from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
    path("ws/game/<str:game_id>", consumers.VideoConsumer),
    #re_path(r'ws/game/(?P<room_name>\w+)/$', consumers.VideoConsumer),
]