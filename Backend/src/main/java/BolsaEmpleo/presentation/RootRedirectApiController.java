package BolsaEmpleo.presentation;

import BolsaEmpleo.logic.Base.Caracteristicas;
import BolsaEmpleo.logic.Puesto;
import BolsaEmpleo.logic.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
//COMENTATIO
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class RootRedirectApiController {

    @Autowired
    private Service service;

    @GetMapping("/")
    public ResponseEntity<?> mostrarPublico() {
        List<Puesto> puestos = service.Top5_PuestosRecientes();
        return ResponseEntity.ok(Map.of("puestos", puestos));
    }

    @GetMapping("/buscaPuesto")
    public ResponseEntity<?> mostrarBuscaPuesto(
            @RequestParam(required = false) List<Integer> ids) {

        List<Caracteristicas> padres = service.findPadresCaracteristicas();
        Map<Integer, List<Caracteristicas>> hijos = new HashMap<>();
        service.construirMapaHijos(padres, hijos);

        Map<String, Object> response = new HashMap<>();
        response.put("padres", padres);
        response.put("hijos", hijos);

        if (ids != null && !ids.isEmpty()) {
            List<Puesto> resultados = service.buscarPuestosPorCaracteristicas(ids);
            response.put("puestos", resultados);
        }

        return ResponseEntity.ok(response);
    }
}