from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def envoyer_notification_admin(data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        'admin_notifications',
        {
            'type': 'notification_message',
            'data': data
        }
    )