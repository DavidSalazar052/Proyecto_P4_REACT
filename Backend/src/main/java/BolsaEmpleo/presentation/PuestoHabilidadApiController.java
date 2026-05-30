package BolsaEmpleo.presentation;

import BolsaEmpleo.logic.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/puestohabilidad")
public class PuestoHabilidadApiController {

    @Autowired
    private Service service;

    @GetMapping("/buscarporhabilidad")
    public ResponseEntity<?> buscar_por_habilidad(@RequestParam String habilidadId) {
        // En la vista original se sacaban los puestos de cada puestoHabilidad,
        // aquí devolvemos directamente la lista en JSON para iterarla en el Frontend.
        return ResponseEntity.ok(Map.of("puestos", service.findBySkill(habilidadId)));
    }
}