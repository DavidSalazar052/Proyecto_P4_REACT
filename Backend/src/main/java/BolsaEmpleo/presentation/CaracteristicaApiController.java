package BolsaEmpleo.presentation;

import BolsaEmpleo.logic.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/caracteristica")
public class CaracteristicaApiController {

    @Autowired
    private Service service;

    // Archivo mantenido según la estructura original vacía.
    // Las operaciones de características están en AdminApiController.
}