import http
from http.client import BAD_REQUEST, MULTIPLE_CHOICES, NOT_FOUND, OK
from msilib.schema import Class
from django.http.request import HttpRequest
from django.http.response import JsonResponse, HttpResponseBase
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from .models import Estacionamiento, EstadoSensor, Nivel, Sensor
import json
import re
from typing import Any
from http import HTTPStatus
from django.shortcuts import render, HttpResponse

# Create your views here.
def planta(request):
    return render(request, "api/planta.html")

def inicio(request):
    return render(request,"api/inicio.html")

def contactos(request):
    return render(request,"api/contactos.html")


class EstacionamientoAPI(View):

    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponseBase:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, park_id=0, nivel_id=None):

        if nivel_id is not None:
            print("holaa get-----")
            park_list = list(Estacionamiento.objects.filter(id_nivel_id__id=nivel_id).order_by('id').select_related().values("id", "id_sensor_id__nombre", "id_nivel_id__descripcion", "id_estado_sensor_id__codigo"))
            data = {'message': "Success", 'totales': len(park_list), 'parking' : park_list}
        elif park_id > 0:
            park_list = list(Estacionamiento.objects.filter(id=park_id).order_by('id').select_related().values("id", "id_sensor_id__nombre", "id_nivel_id__descripcion", "id_estado_sensor_id__codigo"))
            data = {'message': "Success", 'parking' : park_list}
        else:
            park_list = list(Estacionamiento.objects.select_related().order_by('id').values("id", "id_sensor_id__nombre", "id_nivel_id__descripcion", "id_estado_sensor_id__codigo"))
            data = {'message': "Success", 'parking' : park_list}

        if len(park_list) == 0:
            data = {'message': "Parking not found"}

        return JsonResponse(data)

    def post(self, request):
        json = json.loads(request.body)
        data = {'message': "Success"}
        return JsonResponse(data)

    def put(self, request, park_id):
        print("holaa put")
        print(request.body)
        jsonData = json.loads(request.body)
        print(jsonData)
        park = list(Estacionamiento.objects.filter(id=park_id).select_related().values("id", "id_sensor_id__nombre", "id_nivel_id__descripcion", "id_estado_sensor_id__codigo"))

        data = {'message': "Parking not found"}

        if len(park) > 0:

            # id = models.AutoField(primary_key=True)
            # descripcion = models.CharField(max_length=255)
            # codigo = models.CharField(max_length=50)

            objEstado = EstadoSensor.objects.get(codigo=jsonData['estado'])
            tmp = EstadoSensor(
                id = objEstado.id,
                descripcion = objEstado.descripcion,
                codigo = objEstado.codigo,
            )
            updPark = Estacionamiento.objects.get(id=park_id)
            print(updPark)
            print(objEstado)
            print(tmp)
            updPark.id_estado_sensor = tmp
            updPark.save(update_fields=["id_estado_sensor"])
            # data = {'message': "Success", 'parking' : updPark}
            data = {'message': "Success"}

        return JsonResponse(data)

    def delete(self, request):
        pass

class NivelAPI(View):
    def get(self, request, id=0):
        nivel_list = list(Nivel.objects.select_related().values("id", "nivel", "descripcion"))
        data = {'message': "Niveles not found"}
        if len(nivel_list) > 0:
            data = {'message': "Success", 'niveles' : nivel_list}

        return JsonResponse(data)

    def post(self, request):
        json = json.loads(request.body)
        data = {'message': "Success"}
        return JsonResponse(data)

    def put(self, request):
        pass

    def delete(self, request):
        pass

class SensorAPI(View):
    def get(self, request):
        print("hola desde sensor api")
        print(request.GET)

        ip = re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", request.GET['ip'])

        if ip:
            ip = ip.group()

        print("ip: ", ip)

        if ip is None or ip=='':
            data = {'message': "Failed", 'error' : 'No se informó ninguna IP'}
            http_code = HTTPStatus.BAD_REQUEST
            return JsonResponse(data, status=http_code)

        sensores = list(Sensor.objects.filter(ip=ip).select_related().values("id"))
        print("sensor: ", sensores)

        if len(sensores) == 0:
            data = {'message': "Failed", 'error' : 'no se encontró ningún sensor con esa IP'}
            http_code = HTTPStatus.NOT_FOUND
            return JsonResponse(data, status=http_code)
        elif len(sensores) > 1:
            data = {'message': "Failed", 'error' : 'Existe más de un sensor para la IP solicitada'}
            http_code = HTTPStatus.MULTIPLE_CHOICES
            return JsonResponse(data, status=http_code)

        estacionamiento = list(Estacionamiento.objects.filter(id_sensor_id=sensores[0]['id']).select_related())

        print("estacionamiento: ", estacionamiento)

        if len(estacionamiento) == 0:
            data = {'message': "Failed", 'error' : 'no se encontró ninguna cochera con ese sensor'}
            http_code = HTTPStatus.NOT_FOUND
        elif len(estacionamiento) > 1:
            data = {'message': "Failed", 'error' : 'Existe más de una cochera para el sensor indica. Avise al administrador.'}
            http_code = HTTPStatus.MULTIPLE_CHOICES
        else:
            data = {'message': "Success", 'cochera' : estacionamiento[0].id, "reservado" : False,}
            print(data)
            http_code = HTTPStatus.OK

        print("http_code: ", http_code)
        return JsonResponse(data, status=http_code)

    def post(self, request):
        pass

    def put(self, request):
        pass

    def delete(self, request):
        pass

class Ping_sensor(View):

    def get(self, request, id=0):
        nivel_list = list(Ping_sensor.objects.select_related().values("id", "id_sensor", "fecha_ping"))
        data = {'message': "Niveles not found"}
        if len(nivel_list) > 0:
            data = {'message': "Success", 'niveles' : nivel_list}

        return JsonResponse(data)



