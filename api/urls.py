from django.urls import path
from .views import EstacionamientoAPI, NivelAPI, SensorAPI
from api import views


urlpatterns = [
    path('nivel/', NivelAPI.as_view(), name='nivel_list'),
    path('park/', EstacionamientoAPI.as_view(), name='park_list'),
    path('park/<int:park_id>', EstacionamientoAPI.as_view(), name='park_id'),
    path('park/nivel/<int:nivel_id>', EstacionamientoAPI.as_view(), name='park_nivel'),
    path('sensor', SensorAPI.as_view(), name='sensor'), 
    path("planta", views.planta, name="planta"),
    path("inicio", views.inicio, name="inicio"),
    path("contactos", views.contactos, name="contactos"),
    # path('ping_sensor', Ping_sensor.as_view(), name='ping_sensor'),
    
]