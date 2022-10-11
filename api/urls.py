from django.urls import path
from .views import EstacionamientoAPI, NivelAPI, SensorAPI

urlpatterns = [
    path('nivel/', NivelAPI.as_view(), name='nivel_list'),
    path('park/', EstacionamientoAPI.as_view(), name='park_list'),
    path('park/<int:park_id>', EstacionamientoAPI.as_view(), name='park_id'),
    path('park/nivel/<int:nivel_id>', EstacionamientoAPI.as_view(), name='park_nivel'),
    path('sensor', SensorAPI.as_view(), name='sensor'),
]