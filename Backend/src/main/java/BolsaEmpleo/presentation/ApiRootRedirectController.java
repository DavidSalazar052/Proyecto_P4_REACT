package BolsaEmpleo.presentation;

import BolsaEmpleo.logic.Puesto;
import BolsaEmpleo.logic.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ApiRootRedirectController {

    @Autowired
    private Service service;

    @GetMapping("/puestos/recientes")
    public List<Puesto> top5Recientes() {
        return service.Top5_PuestosRecientes();
    }

    @GetMapping("/puestos/buscar")
    public List<Puesto> buscarPorCaracteristicas(@RequestParam List<Integer> ids) {
        return service.buscarPuestosPorCaracteristicas(ids);
    }
}
