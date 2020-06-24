from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json

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

    # receive mesage from WebSocket
    def receive(self, text_data):
        msg_data_json = json.loads(text_data)
        msg_type = msg_data_json["type"]

        if msg_type == "new-ice-candidate":
            msg = msg_data_json["candidate"]
        
        else:
            msg = msg_data_json["sdp"]

        # send mesage to game group
        async_to_sync(self.channel_layer.group_send)(
            self.game_id_name,
            {
                "type": "message",
                "msg_type": msg_type,
                "msg": msg
            }
        )

    def message(self, event):
        msg_type = event["msg_type"]
        msg = event["msg"]

        # send message to WebSocket
        if msg_type == "new-ice-candidate":
            self.send(text_data=json.dumps(
                {
                "type": msg_type,
                "candidate": msg
                }
            ))

        else:
            self.send(text_data=json.dumps(
                {
                "type": msg_type,
                "sdp": msg
                }
            ))