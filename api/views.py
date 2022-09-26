from django.http.request import HttpRequest
from django.http.response import JsonResponse, HttpResponseBase
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from .models import Estacionamiento, EstadoSensor, Nivel
import json
from typing import Any

# Create your views here.
class EstacionamientoAPI(View):

    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponseBase:
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, park_id=0, nivel_id=None):

        if nivel_id is not None:
            park_list = list(Estacionamiento.objects.filter(id_nivel_id__id=nivel_id).order_by('id').select_related().values("id", "id_sensor_id__nombre", "id_nivel_id__descripcion", "id_estado_sensor_id__codigo"))
            data = {'message': "Success", 'totales': len(park_list), 'parking' : park_list}
        elif park_id > 0:
            park_list = list(Estacionamiento.objects.filter(id=park_id).order_by('id').select_related().values("id", "id_sensor_id__nombre", "id_nivel_id__descripcion", "id_estado_sensor_id__codigo"))
            data = {'message': "Success", 'parking' : park_list}
        else:
            park_list = list(Estacionamiento.objects.select_related().order_by('id').values("id", "id_sensor_id__nombre", "id_nivel_id__descripcion", "id_estado_sensor_id__codigo"))

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

            objEstado = EstadoSensor.objects.get(codigo=jsonData['codigo'])
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