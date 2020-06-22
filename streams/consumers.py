from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json

from .models import Game

class VideoConsumer(WebsocketConsumer):
    def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_id_name = "game_%s" % self.game_id

        # join game group
        async_to_sync(self.channel_layer.group_add)(
            self.game_id_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # leave game group
        async_to_sync(self.channel_layer.group_discard)(
            self.game_id_name,
            self.channel_name
        )

    # receive image from WebSocket
    def receive(self, image_data):
        image_data_json = json.loads(image_data)
        image = image_data_json["image"]

        # send image to game group
        async_to_sync(self.channel_layer.group_send)(
            self.game_id_name,
            {
                "type": "image_feed",
                "image": image
            }
        )

    def image_feed(self, event):
        image = event["image"]

        # Send image to WebSocket
        self.send(image_data=json.dumps({
            "image": image
        }))